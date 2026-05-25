import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";

type Props = { params: { provider: string } };

function originOf(request: Request) {
  if (process.env.NODE_ENV === "production" && process.env.AUTH_BASE_URL) {
    return process.env.AUTH_BASE_URL;
  }
  const url = new URL(request.url);
  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
  }
  return url.origin;
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");
  if (!payload) return null;
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

async function handleCallback(request: Request, provider: string, form?: FormData) {
  const origin = originOf(request);
  const url = new URL(request.url);
  const code = String(form?.get("code") ?? url.searchParams.get("code") ?? "");

  if (!code) {
    return NextResponse.redirect(`${origin}/account?authError=${provider}-denied`);
  }

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${origin}/account?authError=google-config`);
    }

    const callback = `${origin}/api/auth/oauth/callback/google`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callback,
        grant_type: "authorization_code",
        code,
      }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) {
      return NextResponse.redirect(`${origin}/account?authError=google-token`);
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const profile = await profileResponse.json();
    if (!profileResponse.ok) {
      return NextResponse.redirect(`${origin}/account?authError=google-profile`);
    }

    setSessionCookie({
      id: `google:${profile.sub}`,
      provider: "google",
      name: profile.name,
      email: profile.email,
    });
    return NextResponse.redirect(`${origin}/account?login=success`);
  }

  if (provider === "facebook") {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${origin}/account?authError=facebook-config`);
    }

    const callback = `${origin}/api/auth/oauth/callback/facebook`;
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", callback);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl);
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) {
      return NextResponse.redirect(`${origin}/account?authError=facebook-token`);
    }

    const profileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${token.access_token}`,
    );
    const profile = await profileResponse.json();
    if (!profileResponse.ok) {
      return NextResponse.redirect(`${origin}/account?authError=facebook-profile`);
    }

    setSessionCookie({
      id: `facebook:${profile.id}`,
      provider: "facebook",
      name: profile.name,
      email: profile.email,
    });
    return NextResponse.redirect(`${origin}/account?login=success`);
  }

  if (provider === "apple") {
    const idToken = String(form?.get("id_token") ?? "");
    if (!idToken) return NextResponse.redirect(`${origin}/account?authError=apple-token`);
    const profile = decodeJwtPayload(idToken);
    setSessionCookie({
      id: `apple:${profile?.sub ?? code}`,
      provider: "apple",
      email: profile?.email,
    });
    return NextResponse.redirect(`${origin}/account?login=success`);
  }

  return NextResponse.redirect(`${origin}/account?authError=unsupported`);
}

export async function GET(request: Request, { params }: Props) {
  return handleCallback(request, params.provider);
}

export async function POST(request: Request, { params }: Props) {
  return handleCallback(request, params.provider, await request.formData());
}
