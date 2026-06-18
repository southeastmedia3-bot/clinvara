"use client";

import { apiUrl } from "@/lib/api/client";
import { firebaseAuth } from "@/lib/firebase/client";

type EmailEventName =
  | "orderPlaced"
  | "adminNewOrder"
  | "returnRequested"
  | "adminNewReturn"
  | "orderCancelled"
  | "passwordReset";

export async function sendEmailEvent(
  eventName: EmailEventName,
  payload: Record<string, unknown>,
) {
  const endpoint = apiUrl("/api/emails/event");
  console.info("EMAIL_TRIGGERED", { eventName, endpoint });
  const token = await firebaseAuth.currentUser?.getIdToken().catch(() => "");
  if (!token) {
    console.error("EMAIL_SENT_FAILED", { eventName, reason: "No signed-in Firebase user" });
    return { sent: false, warning: "No signed-in Firebase user" };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventName, ...payload }),
  }).catch(() => null);

  if (!response?.ok) {
    console.error("EMAIL_SENT_FAILED", {
      eventName,
      endpoint,
      status: response?.status || 0,
    });
    return { sent: false, warning: "Email event skipped" };
  }

  const result = await response.json().catch(() => ({ emailSent: false }));
  console.info(result.emailSent ? "EMAIL_SENT_SUCCESS" : "EMAIL_SENT_FAILED", {
    eventName,
    endpoint,
    warning: result.warning || "",
  });
  return result;
}
