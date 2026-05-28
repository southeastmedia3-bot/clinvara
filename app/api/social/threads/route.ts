import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60 * 15;

type ThreadsPost = {
  id?: string;
  text?: string;
  media_type?: "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

type ThreadsResponse = {
  data?: ThreadsPost[];
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

function uniqueThreadsPosts(posts: ThreadsPost[]) {
  return Array.from(
    new Map(
      posts.map((post) => [
        post.permalink ||
          post.id ||
          post.media_url ||
          `${cleanText(post.text)}-${post.timestamp ?? ""}`,
        post,
      ]),
    ).values(),
  );
}

export async function GET() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }

  const params = new URLSearchParams({
    fields:
      "id,text,media_type,media_url,thumbnail_url,permalink,timestamp",
    limit: "8",
    access_token: accessToken,
  });

  try {
    const response = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads?${params.toString()}`,
      { next: { revalidate: 60 * 15 } },
    );
    const data = (await response.json().catch(() => null)) as
      | ThreadsResponse
      | null;

    if (!response.ok) {
      console.error("Threads social feed API error", {
        status: response.status,
        code: data?.error?.code,
        subcode: data?.error?.error_subcode,
        type: data?.error?.type,
        message: data?.error?.message,
      });
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const posts = uniqueThreadsPosts(data?.data ?? [])
      .filter((post) => post.id && post.permalink)
      .slice(0, 8)
      .map((post) => ({
        id: post.id,
        platform: "threads",
        caption: cleanText(post.text),
        media_type:
          post.media_type === "VIDEO"
            ? "VIDEO"
            : post.media_type === "CAROUSEL_ALBUM"
            ? "CAROUSEL_ALBUM"
            : "IMAGE",
        media_url: post.media_url ?? "",
        thumbnail_url: post.thumbnail_url ?? post.media_url ?? "",
        permalink: post.permalink,
        timestamp: post.timestamp ?? "",
      }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Threads social feed request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
