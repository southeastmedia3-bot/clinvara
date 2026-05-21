import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";

const CHECK_URL = (serviceSid: string) =>
  `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;

function normalizePhone(countryCode: string, phone: string) {
  const code = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  return `${code}${phone.replace(/\D/g, "")}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = String(body?.phone ?? "").replace(/\D/g, "");
  const countryCode = String(body?.countryCode ?? "+91");
  const otp = String(body?.otp ?? "").replace(/\D/g, "");

  if (!/^\d{7,15}$/.test(phone) || !/^\d{4,8}$/.test(otp)) {
    return NextResponse.json({ error: "Enter the OTP sent to your phone." }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return NextResponse.json(
      {
        error:
          "OTP verification is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID to .env.local.",
      },
      { status: 503 },
    );
  }

  const to = normalizePhone(countryCode, phone);
  const response = await fetch(CHECK_URL(serviceSid), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, Code: otp }),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status !== "approved") {
    return NextResponse.json(
      { error: result?.message ?? "Invalid or expired OTP." },
      { status: response.ok ? 401 : response.status },
    );
  }

  setSessionCookie({ provider: "otp", phone: to });
  return NextResponse.json({ ok: true });
}
