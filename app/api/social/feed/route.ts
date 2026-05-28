import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ThreadsApiItem = {
  id?: string;
  text?: string;
  media_type?: "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink?: string;
  timestamp?: string;
};

type ThreadsApiResponse = {
  data?: ThreadsApiItem[];
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
};

function cleanText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeMediaType(mediaType?: ThreadsApiItem["media_type"]) {
  if (
    mediaType === "TEXT" ||
    mediaType === "IMAGE" ||
    mediaType === "VIDEO" ||
    mediaType === "CAROUSEL_ALBUM"
  ) {
    return mediaType;
  }

  return "TEXT";
}

function normalizeThreadsPosts(items: ThreadsApiItem[]) {
  const seen = new Set<string>();

  return items
    .filter((item) => {
      const keys = [
        item.id ? `id:${item.id}` : "",
        item.permalink ? `permalink:${item.permalink}` : "",
        item.media_url ? `media:${item.media_url}` : "",
      ].filter(Boolean);

      if (!item.id || !item.permalink || keys.some((key) => seen.has(key))) {
        return false;
      }

      keys.forEach((key) => seen.add(key));
      return true;
    })
    .slice(0, 7)
    .map((item) => ({
      id: item.id ?? "",
      platform: "threads",
      title: "Latest Thread",
      caption: cleanText(item.text),
      thumbnail_url: item.media_url || null,
      media_url: item.media_url || null,
      permalink: item.permalink ?? "",
      timestamp: item.timestamp ?? "",
      media_type: normalizeMediaType(item.media_type),
    }));
}

export async function GET() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }

  const params = new URLSearchParams({
    fields: "id,text,media_type,media_url,permalink,timestamp",
    access_token: accessToken,
  });

  try {
    const response = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads?${params.toString()}`,
      { cache: "no-store" },
    );
    const data = (await response.json().catch(() => null)) as
      | ThreadsApiResponse
      | null;

    if (!response.ok) {
      console.error("Threads-only social feed failed", {
        status: response.status,
        code: data?.error?.code,
        subcode: data?.error?.error_subcode,
        type: data?.error?.type,
        message: data?.error?.message,
      });
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    return NextResponse.json({
      posts: normalizeThreadsPosts(data?.data ?? []),
    });
  } catch (error) {
    console.error("Threads-only social feed errored", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
