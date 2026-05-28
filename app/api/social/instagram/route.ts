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

type InstagramApiResponse = {
  data?: InstagramMediaItem[];
};

function shortCaption(caption = "") {
  return caption.replace(/\s+/g, " ").trim();
}

function uniqueInstagramItems(items: InstagramMediaItem[]) {
  return Array.from(
    new Map(
      items.map((item) => [
        item.permalink ||
          item.id ||
          item.media_url ||
          `${shortCaption(item.caption)}-${item.timestamp ?? ""}`,
        item,
      ]),
    ).values(),
  );
}

async function readInstagramMedia(url: string) {
  const response = await fetch(url, { next: { revalidate: 60 * 15 } });
  const data = (await response.json().catch(() => null)) as
    | InstagramApiResponse
    | InstagramErrorResponse
    | null;

  if (!response.ok) {
    const errorData = data as InstagramErrorResponse | null;
    console.error("Instagram API error", {
      status: response.status,
      code: errorData?.error?.code,
      subcode: errorData?.error?.error_subcode,
      type: errorData?.error?.type,
      message: errorData?.error?.message,
    });
    return [];
  }

  return Array.isArray((data as InstagramApiResponse | null)?.data)
    ? ((data as InstagramApiResponse).data ?? [])
    : [];
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
    const graphUrl = `https://graph.facebook.com/v19.0/${userId}/media?${params.toString()}`;
    const basicDisplayUrl = `https://graph.instagram.com/${userId}/media?${params.toString()}`;
    const graphItems = await readInstagramMedia(graphUrl);
    const items = graphItems.length
      ? graphItems
      : await readInstagramMedia(basicDisplayUrl);

    const posts =
      uniqueInstagramItems(items)
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
