import { NextResponse } from "next/server";

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

export async function GET(request: Request, { params }: Props) {
  const provider = params.provider;
  const origin = originOf(request);

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(`${origin}/account?authError=google-config`);
    }
    const callback = `${origin}/api/auth/oauth/callback/google`;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("prompt", "select_account");
    return NextResponse.redirect(url);
  }

  if (provider === "facebook") {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(`${origin}/account?authError=facebook-config`);
    }
    const callback = `${origin}/api/auth/oauth/callback/facebook`;
    const url = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("scope", "email,public_profile");
    return NextResponse.redirect(url);
  }

  if (provider === "apple") {
    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(`${origin}/account?authError=apple-config`);
    }
    const callback = `${origin}/api/auth/oauth/callback/apple`;
    const url = new URL("https://appleid.apple.com/auth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", callback);
    url.searchParams.set("response_type", "code id_token");
    url.searchParams.set("scope", "name email");
    url.searchParams.set("response_mode", "form_post");
    return NextResponse.redirect(url);
  }

  return NextResponse.json({ error: "Unsupported provider." }, { status: 404 });
}
