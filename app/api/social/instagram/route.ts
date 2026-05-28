import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60 * 15;

type InstagramMediaItem = {
  id?: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
};

type InstagramErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
};

function shortCaption(caption = "") {
  return caption.replace(/\s+/g, " ").trim();
}

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!accessToken || !userId) {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "permalink",
    "thumbnail_url",
    "timestamp",
  ].join(",");

  const params = new URLSearchParams({
    fields,
    access_token: accessToken,
  });

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${userId}/media?${params.toString()}`,
      { next: { revalidate: 60 * 15 } },
    );

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as
        | InstagramErrorResponse
        | null;
      console.error("Instagram Graph API error", {
        status: response.status,
        code: errorData?.error?.code,
        subcode: errorData?.error?.error_subcode,
        type: errorData?.error?.type,
        message: errorData?.error?.message,
      });
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const data = (await response.json()) as { data?: InstagramMediaItem[] };
    const posts =
      data.data
        ?.filter((item) => item.id && item.permalink)
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          platform: "instagram",
          caption: shortCaption(item.caption),
          media_type: item.media_type ?? "IMAGE",
          media_url: item.media_url ?? "",
          thumbnail_url: item.thumbnail_url ?? "",
          permalink: item.permalink,
          timestamp: item.timestamp ?? "",
        }))
        .filter((item) => item.media_url || item.thumbnail_url) ?? [];

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Instagram Graph API request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
