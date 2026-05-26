import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "clinvara_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionUser = {
  id: string;
  provider: "otp" | "google" | "facebook" | "apple";
  phone?: string;
  name?: string;
  email?: string;
};

function secret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "clinvara-local-dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(user: Omit<SessionUser, "id"> & { id?: string }) {
  const payload = Buffer.from(
    JSON.stringify({ ...user, id: user.id ?? randomUUID(), createdAt: Date.now() }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string): SessionUser | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

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

export function setSessionCookie(user: Omit<SessionUser, "id"> & { id?: string }) {
  cookies().set(COOKIE_NAME, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function getCurrentSession() {
  return readSessionToken(cookies().get(COOKIE_NAME)?.value);
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}
