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
      `https://graph.instagram.com/${userId}/media?${params.toString()}`,
      { next: { revalidate: 60 * 15 } },
    );

    if (!response.ok) {
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const data = (await response.json()) as { data?: InstagramMediaItem[] };
    const posts =
      data.data
        ?.filter((item) => item.id && item.permalink)
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          caption: shortCaption(item.caption),
          mediaType: item.media_type ?? "IMAGE",
          image:
            item.media_type === "VIDEO"
              ? item.thumbnail_url ?? item.media_url ?? ""
              : item.media_url ?? item.thumbnail_url ?? "",
          href: item.permalink,
          timestamp: item.timestamp ?? "",
        }))
        .filter((item) => item.image) ?? [];

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
