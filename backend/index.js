const crypto = require("crypto");
const express = require("express");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { allProducts } = require("./data/products");
const {
  checkInstagramToken,
  getInstagramFeed,
  getSocialFeed,
} = require("./socialFeed");

const instagramAccessToken = defineSecret("INSTAGRAM_ACCESS_TOKEN");
const threadsAccessToken = defineSecret("THREADS_ACCESS_TOKEN");
const youtubeApiKey = defineSecret("YOUTUBE_API_KEY");
const resendApiKey = defineSecret("RESEND_API_KEY");

const SUPPORT_PHONE = "+91 72071 18111";

function contactEmail() {
  return process.env.CONTACT_TO_EMAIL || "clinvaraglobal@gmail.com";
}

async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[CLINVARA email] RESEND_API_KEY missing; email skipped", { to, subject });
    return { sent: false, warning: "RESEND_API_KEY missing" };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "CLINVARA <clinvaraglobal@gmail.com>",
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.warn("[CLINVARA email] send failed", { status: response.status, data });
    return { sent: false, warning: data?.message || response.statusText };
  }
  return { sent: true };
}

function money(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

const app = express();
app.use(express.json());
if (!admin.apps.length) admin.initializeApp();

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_BASE_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = allowedOrigins();
  if (origin && (allowed.length === 0 || allowed.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  return next();
});

const productContext = allProducts
  .map(
    (product) =>
      `${product.name}: ${product.description} Concerns: ${product.concerns.join(
        ", ",
      )}. Price: INR ${product.price}. Slug: /shop/${product.slug}. Ingredients: ${product.ingredients}`,
  )
  .join("\n");

function authSecret() {
  return process.env.AUTH_SECRET || "clinvara-local-dev-secret";
}

function sign(payload) {
  return crypto.createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      id: user.id || crypto.randomUUID(),
      createdAt: Date.now(),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return {
      id: parsed.id,
      provider: parsed.provider,
      phone: parsed.phone,
      name: parsed.name,
      email: parsed.email,
    };
  } catch {
    return null;
  }
}

function cookieValue(req, name) {
  const cookie = req.headers.cookie || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function setSessionCookie(res, user) {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  res.setHeader(
    "Set-Cookie",
    `clinvara_session=${createSessionToken(user)}; HttpOnly; SameSite=Lax;${secure} Path=/; Max-Age=2592000`,
  );
}

function backendBaseUrl(req) {
  return process.env.AUTH_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function frontendBaseUrl() {
  return process.env.FRONTEND_BASE_URL || "http://127.0.0.1:3000";
}

function applyInstagramCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = new Set([
    "https://clinvara.global",
    "https://www.clinvara.global",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://clinvara.global");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "clinvara-backend" });
});

app.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email." });
  }
  const createdAt = new Date();
  const db = admin.firestore();
  const messageRef = await db.collection("contactMessages").add({
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || "",
    message: message.trim(),
    status: "new",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const emailResult = await sendEmail({
    to: contactEmail(),
    replyTo: email.trim(),
    subject: `New CLINVARA contact enquiry from ${name.trim()}`,
    html: `
      <h2>New CLINVARA contact enquiry</h2>
      <p><strong>Name:</strong> ${name.trim()}</p>
      <p><strong>Email:</strong> ${email.trim()}</p>
      <p><strong>Phone:</strong> ${phone?.trim() || "-"}</p>
      <p><strong>Message:</strong></p>
      <p>${message.trim().replace(/\n/g, "<br />")}</p>
      <p><strong>Timestamp:</strong> ${createdAt.toISOString()}</p>
    `,
  });
  return res.json({ ok: true, id: messageRef.id, emailSent: emailResult.sent });
});

app.get("/social/feed", async (_req, res) => {
  try {
    const payload = await getSocialFeed();
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    return res.json(payload);
  } catch (error) {
    console.error("[CLINVARA social] feed failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return res.json({ posts: [] });
  }
});

app.get("/social/instagram-status", async (_req, res) => {
  const status = await checkInstagramToken();
  return res.status(status.ok ? 200 : 200).json(status);
});

app.post("/orders/track", async (req, res) => {
  const orderId = String(req.body?.orderId || "").trim();
  const contact = String(req.body?.contact || "").trim().toLowerCase();
  if (!orderId || !contact) {
    return res.status(400).json({ error: "Order ID and email or phone are required." });
  }

  const db = admin.firestore();
  const direct = await db.collection("orders").doc(orderId).get();
  let orderDoc = direct.exists ? direct : null;

  if (!orderDoc) {
    const byOrderId = await db
      .collection("orders")
      .where("orderId", "==", orderId)
      .limit(1)
      .get();
    orderDoc = byOrderId.docs[0] || null;
  }

  if (!orderDoc) {
    const byPublicOrderId = await db
      .collection("orders")
      .where("publicOrderId", "==", orderId)
      .limit(1)
      .get();
    orderDoc = byPublicOrderId.docs[0] || null;
  }

  if (!orderDoc) {
    return res.json({ order: null });
  }

  const data = orderDoc.data() || {};
  const allowedContacts = [
    data.email,
    data.checkoutEmail,
    data.customerEmail,
    data.customerPhone,
    data.shippingAddress?.phone,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (!allowedContacts.includes(contact)) {
    return res.json({ order: null });
  }

  return res.json({
    order: {
      id: orderDoc.id,
      orderId: data.publicOrderId || data.orderId || orderDoc.id,
      adminDecision: data.adminDecision || "pending",
      orderStatus: data.orderStatus || data.status || "waiting_confirmation",
      publicOrderStatus: data.publicOrderStatus || "waiting_confirmation",
      paymentStatus: data.paymentStatus || "pending",
      rejectionReason: data.rejectionReason || "",
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || "",
      confirmedAt: data.confirmedAt || "",
      packedAt: data.packedAt || "",
      pickedUpAt: data.pickedUpAt || "",
      inTransitAt: data.inTransitAt || data.shippedAt || "",
      shippedAt: data.shippedAt || "",
      outForDeliveryAt: data.outForDeliveryAt || "",
      deliveredAt: data.deliveredAt || "",
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || "",
    },
  });
});

async function isAdminUser(req) {
  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return false;
  const decoded = await admin.auth().verifyIdToken(token).catch(() => null);
  if (!decoded?.uid) return false;
  const userDoc = await admin.firestore().collection("users").doc(decoded.uid).get();
  const customerDoc = await admin.firestore().collection("customers").doc(decoded.uid).get();
  const allowedEmails = String(process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return (
    userDoc.data()?.role === "admin" ||
    customerDoc.data()?.role === "admin" ||
    (decoded.email && allowedEmails.includes(decoded.email.toLowerCase()))
  );
}

function publicOrderId(id) {
  return `CLV-${String(id).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}`;
}

function addressLines(address = {}) {
  return [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

async function sendOrderEmail(order, type) {
  const email = order.email || order.checkoutEmail || order.customerEmail;
  if (!email) return { sent: false, warning: "No customer email" };
  const id = order.publicOrderId || order.orderId || "CLINVARA order";
  const products = Array.isArray(order.items)
    ? order.items.map((item) => `<li>${item.name || "Product"} x ${item.quantity || 1}</li>`).join("")
    : "";
  const subject =
    type === "accepted"
      ? `Your CLINVARA order ${id} is confirmed`
      : `Your CLINVARA order ${id} could not be confirmed`;
  const body =
    type === "accepted"
      ? `
        <h2>Your CLINVARA order is confirmed</h2>
        <p>Order ID: <strong>${id}</strong></p>
        <p>Status: Confirmed</p>
        <p>Total: ${money(order.subtotal || order.totalAmount)}</p>
        <p>Shipping address: ${addressLines(order.shippingAddress)}</p>
        <ul>${products}</ul>
        <p>Track your order: <a href="https://clinvara.global/track-order">https://clinvara.global/track-order</a></p>
        <p>Support: ${SUPPORT_PHONE}</p>
      `
      : `
        <h2>Your CLINVARA order could not be confirmed</h2>
        <p>Order ID: <strong>${id}</strong></p>
        <p>${order.rejectionReason || "Your order could not be confirmed. Please contact CLINVARA support."}</p>
        <p>Support: ${SUPPORT_PHONE}</p>
      `;
  return sendEmail({ to: email, subject, html: body });
}

app.post("/orders/admin-update", async (req, res) => {
  if (!(await isAdminUser(req))) {
    return res.status(403).json({ error: "Admin access required." });
  }
  const { orderId, action, patch = {} } = req.body || {};
  if (!orderId) return res.status(400).json({ error: "Order ID is required." });

  const db = admin.firestore();
  const ref = db.collection("orders").doc(String(orderId));
  const snapshot = await ref.get();
  if (!snapshot.exists) return res.status(404).json({ error: "Order not found." });
  const existing = snapshot.data() || {};
  const now = admin.firestore.FieldValue.serverTimestamp();
  let update = { ...patch, updatedAt: now };

  if (action === "accept") {
    update = {
      ...update,
      publicOrderId: existing.publicOrderId || publicOrderId(snapshot.id),
      adminDecision: "accepted",
      orderStatus: "confirmed",
      publicOrderStatus: "confirmed",
      confirmedAt: now,
    };
  }
  if (action === "reject") {
    update = {
      ...update,
      publicOrderId: existing.publicOrderId || publicOrderId(snapshot.id),
      adminDecision: "rejected",
      orderStatus: "rejected",
      publicOrderStatus: "rejected",
      rejectedAt: now,
    };
  }

  const ownerId = existing.userId || existing.uid || existing.customerId;
  const batch = db.batch();
  batch.set(ref, update, { merge: true });
  if (ownerId) {
    batch.set(
      db.collection("customers").doc(String(ownerId)).collection("orders").doc(snapshot.id),
      {
        ...update,
        id: snapshot.id,
      },
      { merge: true },
    );
  }
  await batch.commit();
  const nextSnapshot = await ref.get();
  const nextOrder = { ...(nextSnapshot.data() || {}), ...update };
  const emailResult =
    action === "accept"
      ? await sendOrderEmail(nextOrder, "accepted")
      : action === "reject"
        ? await sendOrderEmail(nextOrder, "rejected")
        : { sent: false };
  return res.json({ ok: true, emailSent: emailResult.sent });
});

app.get("/social/instagram-feed", async (_req, res) => {
  const payload = await getInstagramFeed();
  return res.status(200).json(payload);
});

app.post("/chat", async (req, res) => {
  const messages = req.body?.messages || [];
  const latest = messages[messages.length - 1]?.text?.trim();
  if (!latest) return res.status(400).json({ error: "Please enter a question." });
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({
      error: "AI chat is not configured. Add GROQ_API_KEY to backend environment.",
    });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are CLINVARA Assist, a professional skincare and ecommerce concierge for the CLINVARA website.
Answer general questions naturally and helpfully, but keep skincare advice careful and non-medical.
Do not diagnose conditions, promise cures, or replace a dermatologist.
When a CLINVARA product is relevant, recommend from this catalog and include the product page path.
Keep answers concise, polished, and useful for a premium minimalist skincare brand.

Catalog:
${productContext}`,
          },
          ...messages.slice(-10).map((message) => ({
            role: message.role,
            content: message.text,
          })),
        ],
        max_completion_tokens: 450,
        temperature: 0.5,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const providerMessage =
        data?.error?.message || data?.message || data?.error || response.statusText;
      return res.status(response.status).json({
        error: `Groq error (${response.status}): ${providerMessage}`,
      });
    }
    return res.json({
      answer:
        data?.choices?.[0]?.message?.content?.trim() ||
        "I could not generate a clear answer just now. Please try again.",
    });
  } catch {
    return res.status(502).json({
      error: "The server could not reach Groq. Check backend network access.",
    });
  }
});

app.get("/auth/session", (req, res) => {
  res.json({ user: readSessionToken(cookieValue(req, "clinvara_session")) });
});

app.get("/auth/oauth/:provider", (req, res) => {
  const provider = req.params.provider;
  const origin = backendBaseUrl(req);
  if (provider === "google") {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.redirect(`${frontendBaseUrl()}/account?authError=google-config`);
    }
    const callback = `${origin}/auth/oauth/callback/google`;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("prompt", "select_account");
    return res.redirect(url.toString());
  }
  if (provider === "facebook") {
    if (!process.env.FACEBOOK_CLIENT_ID) {
      return res.redirect(`${frontendBaseUrl()}/account?authError=facebook-config`);
    }
    const callback = `${origin}/auth/oauth/callback/facebook`;
    const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    url.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("scope", "email,public_profile");
    return res.redirect(url.toString());
  }
  return res.status(404).json({ error: "Unsupported provider." });
});

app.get("/auth/oauth/callback/:provider", async (req, res) => {
  const provider = req.params.provider;
  const code = String(req.query.code || "");
  if (!code) return res.redirect(`${frontendBaseUrl()}/account?authError=${provider}-denied`);

  if (provider === "google") {
    const callback = `${backendBaseUrl(req)}/auth/oauth/callback/google`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: callback,
        grant_type: "authorization_code",
        code,
      }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) {
      return res.redirect(`${frontendBaseUrl()}/account?authError=google-token`);
    }
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const profile = await profileResponse.json();
    if (!profileResponse.ok) {
      return res.redirect(`${frontendBaseUrl()}/account?authError=google-profile`);
    }
    setSessionCookie(res, {
      id: `google:${profile.sub}`,
      provider: "google",
      name: profile.name,
      email: profile.email,
    });
    return res.redirect(`${frontendBaseUrl()}/account?login=success`);
  }

  if (provider === "facebook") {
    const callback = `${backendBaseUrl(req)}/auth/oauth/callback/facebook`;
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID || "");
    tokenUrl.searchParams.set("client_secret", process.env.FACEBOOK_CLIENT_SECRET || "");
    tokenUrl.searchParams.set("redirect_uri", callback);
    tokenUrl.searchParams.set("code", code);
    const tokenResponse = await fetch(tokenUrl);
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) {
      return res.redirect(`${frontendBaseUrl()}/account?authError=facebook-token`);
    }
    const profileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${token.access_token}`,
    );
    const profile = await profileResponse.json();
    if (!profileResponse.ok) {
      return res.redirect(`${frontendBaseUrl()}/account?authError=facebook-profile`);
    }
    setSessionCookie(res, {
      id: `facebook:${profile.id}`,
      provider: "facebook",
      name: profile.name,
      email: profile.email,
    });
    return res.redirect(`${frontendBaseUrl()}/account?login=success`);
  }

  return res.redirect(`${frontendBaseUrl()}/account?authError=unsupported`);
});

exports.api = onRequest(
  {
    region: "asia-south1",
    secrets: [instagramAccessToken, threadsAccessToken, youtubeApiKey, resendApiKey],
  },
  app,
);

exports.getInstagramFeed = onRequest(
  {
    region: "asia-south1",
    secrets: [instagramAccessToken],
  },
  async (req, res) => {
    if (applyInstagramCors(req, res)) return;

    try {
      const payload = await getInstagramFeed();
      return res.status(200).json(payload);
    } catch (error) {
      console.error("[CLINVARA social] getInstagramFeed failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return res.status(200).json({
        posts: [],
        error: {
          message: "Instagram feed could not be loaded.",
        },
      });
    }
  },
);
