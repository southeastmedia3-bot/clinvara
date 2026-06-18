const SUPPORT_EMAIL = "clinvaraglobal@gmail.com";
const SUPPORT_PHONE = "+91 72071 18111";
const AUTOMATED_SENDER = "CLINVARA <noreply@clinvara.global>";

function contactEmail() {
  return process.env.CONTACT_TO_EMAIL || SUPPORT_EMAIL;
}

function fromEmail() {
  return process.env.RESEND_FROM_EMAIL || AUTOMATED_SENDER;
}

function money(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

function orderDisplayId(order = {}) {
  return order.publicOrderId || order.orderId || order.id || "CLINVARA order";
}

function addressLines(address = {}) {
  return [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

function orderItemsHtml(order = {}) {
  return Array.isArray(order.items)
    ? order.items
        .map((item) => `<li>${item.name || "Product"} x ${item.quantity || 1}</li>`)
        .join("")
    : "";
}

function baseTemplate({ title, intro, body = "", ctaLabel, ctaUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111;line-height:1.6">
      <p style="letter-spacing:0.16em;text-transform:uppercase;font-size:12px;color:#666">CLINVARA</p>
      <h2 style="font-family:Georgia,serif;font-size:28px;margin:8px 0 16px">${title}</h2>
      <p>${intro}</p>
      ${body}
      ${
        ctaUrl
          ? `<p><a href="${ctaUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none">${ctaLabel || "Open CLINVARA"}</a></p>`
          : ""
      }
      <p style="font-size:13px;color:#666">Support: ${SUPPORT_EMAIL} | ${SUPPORT_PHONE}</p>
    </div>
  `;
}

const emailTemplates = {
  orderPlaced: ({ order }) => ({
    subject: `We received your CLINVARA order ${orderDisplayId(order)}`,
    html: baseTemplate({
      title: "Order placed",
      intro: `Your order <strong>${orderDisplayId(order)}</strong> has been received and is waiting for confirmation.`,
      body: `<p>Total: <strong>${money(order.subtotal || order.totalAmount)}</strong></p><ul>${orderItemsHtml(order)}</ul>`,
      ctaLabel: "Track Order",
      ctaUrl: "https://clinvara.global/track-order",
    }),
  }),
  orderConfirmed: ({ order }) => ({
    subject: `Your CLINVARA order ${orderDisplayId(order)} is confirmed`,
    html: baseTemplate({
      title: "Order confirmed",
      intro: `Your order <strong>${orderDisplayId(order)}</strong> has been confirmed.`,
      body: `<p>Total: <strong>${money(order.subtotal || order.totalAmount)}</strong></p><p>Shipping address: ${addressLines(order.shippingAddress)}</p><ul>${orderItemsHtml(order)}</ul>`,
      ctaLabel: "Track Order",
      ctaUrl: "https://clinvara.global/track-order",
    }),
  }),
  orderShipped: ({ order }) => ({
    subject: `Your CLINVARA order ${orderDisplayId(order)} is on the way`,
    html: baseTemplate({
      title: "Order shipped",
      intro: `Your order <strong>${orderDisplayId(order)}</strong> is now in transit.`,
      ctaLabel: "Track Order",
      ctaUrl: "https://clinvara.global/track-order",
    }),
  }),
  orderDelivered: ({ order }) => ({
    subject: `Your CLINVARA order ${orderDisplayId(order)} has been delivered`,
    html: baseTemplate({
      title: "Order delivered",
      intro: `Your order <strong>${orderDisplayId(order)}</strong> has been delivered. We hope your routine feels good.`,
      ctaLabel: "View Orders",
      ctaUrl: "https://clinvara.global/account/orders",
    }),
  }),
  orderCancelled: ({ order }) => ({
    subject: `Your CLINVARA order ${orderDisplayId(order)} was cancelled`,
    html: baseTemplate({
      title: "Order cancelled",
      intro: `Your order <strong>${orderDisplayId(order)}</strong> has been cancelled.`,
      body: order.cancellationReason ? `<p>Reason: ${order.cancellationReason}</p>` : "",
      ctaLabel: "Contact Support",
      ctaUrl: "https://clinvara.global/contact",
    }),
  }),
  returnRequested: ({ returnRequest }) => ({
    subject: `Return request received for ${returnRequest.orderDisplayId || returnRequest.orderId || "your CLINVARA order"}`,
    html: baseTemplate({
      title: "Return request received",
      intro: `We received your return request for <strong>${returnRequest.productName || "your product"}</strong>.`,
      body: `<p>Reason: ${returnRequest.reason || "Not provided"}</p>`,
      ctaLabel: "View Orders",
      ctaUrl: "https://clinvara.global/account/orders",
    }),
  }),
  returnApproved: ({ returnRequest }) => ({
    subject: `Your CLINVARA return request was approved`,
    html: baseTemplate({
      title: "Return approved",
      intro: `Your return request for <strong>${returnRequest.productName || "your product"}</strong> has been approved.`,
    }),
  }),
  refundProcessed: ({ returnRequest }) => ({
    subject: `Your CLINVARA refund has been processed`,
    html: baseTemplate({
      title: "Refund processed",
      intro: `Your refund for <strong>${returnRequest.productName || "your returned product"}</strong> has been processed.`,
    }),
  }),
  passwordReset: () => ({
    subject: "Reset your CLINVARA password",
    html: baseTemplate({
      title: "Password reset",
      intro: "A secure Firebase password reset link has been requested for your CLINVARA account.",
    }),
  }),
  adminNewOrder: ({ order }) => ({
    subject: `New CLINVARA order ${orderDisplayId(order)}`,
    html: baseTemplate({
      title: "New order",
      intro: `A new order <strong>${orderDisplayId(order)}</strong> is waiting for admin review.`,
      body: `<p>Total: <strong>${money(order.subtotal || order.totalAmount)}</strong></p><ul>${orderItemsHtml(order)}</ul>`,
      ctaLabel: "Open Admin",
      ctaUrl: "https://clinvara.global/admin/orders",
    }),
  }),
  adminNewReturn: ({ returnRequest }) => ({
    subject: `New CLINVARA return request`,
    html: baseTemplate({
      title: "New return request",
      intro: `${returnRequest.customerName || "A customer"} requested a return for <strong>${returnRequest.productName || "a product"}</strong>.`,
      body: `<p>Reason: ${returnRequest.reason || "Not provided"}</p>`,
      ctaLabel: "Open Returns",
      ctaUrl: "https://clinvara.global/admin/returns",
    }),
  }),
};

async function sendEmail({ to, subject, html, replyTo }) {
  console.info("EMAIL_SERVICE_STARTED", {
    to,
    subject,
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    sender: fromEmail(),
  });
  if (!process.env.RESEND_API_KEY) {
    console.error("EMAIL_SENT_FAILED", {
      to,
      subject,
      reason: "RESEND_API_KEY missing at runtime",
    });
    console.warn("[CLINVARA email] RESEND_API_KEY missing; email skipped", { to, subject });
    return { sent: false, warning: "RESEND_API_KEY missing" };
  }

  console.info("RESEND_CLIENT_CREATED", { transport: "HTTPS fetch", sender: fromEmail() });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail(),
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("EMAIL_SENT_FAILED", {
      to,
      subject,
      status: response.status,
      providerMessage: data?.message || response.statusText,
    });
    console.warn("[CLINVARA email] send failed", { status: response.status, data });
    return { sent: false, warning: data?.message || response.statusText };
  }
  console.info("EMAIL_SENT_SUCCESS", { to, subject, providerId: data?.id || "" });
  return { sent: true };
}

async function sendCustomerEmail(eventName, payload) {
  const template = emailTemplates[eventName];
  const to =
    payload?.to ||
    payload?.order?.email ||
    payload?.order?.checkoutEmail ||
    payload?.order?.customerEmail ||
    payload?.returnRequest?.customerEmail;
  if (!template || !to) return { sent: false, warning: "Missing template or recipient" };
  return sendEmail({ to, ...template(payload) });
}

async function sendAdminEmail(eventName, payload) {
  const template = emailTemplates[eventName];
  if (!template) return { sent: false, warning: "Missing template" };
  return sendEmail({ to: contactEmail(), ...template(payload) });
}

module.exports = {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  contactEmail,
  emailTemplates,
  sendAdminEmail,
  sendCustomerEmail,
  sendEmail,
};
