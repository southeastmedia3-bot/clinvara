const crypto = require("crypto");
const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");
const { allProducts } = require("./data/products");

const app = express();
app.use(express.json());

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

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "clinvara-backend" });
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email." });
  }
  console.info("[CLINVARA contact]", { name, email, message });
  return res.json({ ok: true });
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

exports.api = onRequest({ region: "asia-south1" }, app);
