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
  const token = await firebaseAuth.currentUser?.getIdToken().catch(() => "");
  if (!token) return { sent: false, warning: "No signed-in Firebase user" };

  const response = await fetch(apiUrl("/api/emails/event"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ eventName, ...payload }),
  }).catch(() => null);

  if (!response?.ok) {
    return { sent: false, warning: "Email event skipped" };
  }

  return response.json().catch(() => ({ sent: false }));
}
