import { NextResponse } from "next/server";

const VERIFY_URL = (serviceSid: string) =>
  `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;

function normalizePhone(countryCode: string, phone: string) {
  const code = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  return `${code}${phone.replace(/\D/g, "")}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = String(body?.phone ?? "").replace(/\D/g, "");
  const countryCode = String(body?.countryCode ?? "+91");

  if (!/^\d{7,15}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    return NextResponse.json(
      {
        error:
          "OTP delivery is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID to .env.local.",
      },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    To: normalizePhone(countryCode, phone),
    Channel: "sms",
  });

  const response = await fetch(VERIFY_URL(serviceSid), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      { error: error?.message ?? "Unable to send OTP right now." },
      { status: response.status },
    );
  }

  return NextResponse.json({ ok: true });
}
