import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SocialPost = {
  id: string;
  platform: "instagram" | "youtube" | "threads";
  title?: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "TEXT";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

type SocialApiResponse = {
  posts?: unknown;
  videos?: unknown;
};

type ThreadsApiItem = {
  id?: string;
  text?: string;
  media_type?: "TEXT" | "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
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

function postImage(post: SocialPost) {
  return post.media_type === "VIDEO"
    ? post.thumbnail_url || post.media_url
    : post.media_url || post.thumbnail_url;
}

function postTime(post: SocialPost) {
  const time = Date.parse(post.timestamp);
  return Number.isFinite(time) ? time : 0;
}

function normalizedText(value = "") {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function cleanText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function isSocialPost(value: unknown): value is SocialPost {
  if (!value || typeof value !== "object") return false;

  const post = value as Partial<SocialPost>;
  return Boolean(
    post.id &&
      (post.platform === "instagram" ||
        post.platform === "youtube" ||
        post.platform === "threads") &&
      post.permalink,
  );
}

function normalizePosts(value: unknown) {
  return Array.isArray(value) ? value.filter(isSocialPost) : [];
}

function uniqueLatestPosts(posts: SocialPost[]) {
  const seen = new Set<string>();

  return posts
    .filter((post) => {
      const image = postImage(post);
      const keys = [
        post.id ? `${post.platform}:id:${post.id}` : "",
        post.permalink ? `permalink:${post.permalink}` : "",
        image ? `media:${image}` : "",
        post.caption || post.timestamp
          ? `caption-time:${normalizedText(post.caption)}:${post.timestamp}`
          : "",
      ].filter(Boolean);

      if (keys.some((key) => seen.has(key))) return false;
      keys.forEach((key) => seen.add(key));
      return Boolean(post.permalink && (image || post.caption));
    })
    .sort((a, b) => postTime(b) - postTime(a))
    .slice(0, 7);
}

async function fetchPosts(origin: string, path: string) {
  try {
    const response = await fetch(new URL(path, origin), {
      cache: "no-store",
    });
    const data = (await response.json().catch(() => null)) as
      | SocialApiResponse
      | null;

    return normalizePosts(data?.posts);
  } catch (error) {
    console.error("Social feed source failed", {
      path,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}

function normalizeThreadsItems(items: ThreadsApiItem[]) {
  return Array.from(
    new Map(
      items.map((item) => [
        item.permalink ||
          item.id ||
          item.media_url ||
          `${cleanText(item.text)}-${item.timestamp ?? ""}`,
        item,
      ]),
    ).values(),
  )
    .filter((item) => item.id && item.permalink)
    .slice(0, 8)
    .map<SocialPost>((item) => ({
      id: item.id ?? "",
      platform: "threads",
      title: "Latest Thread",
      caption: cleanText(item.text),
      media_type:
        item.media_type === "TEXT"
          ? "TEXT"
          : item.media_type === "VIDEO"
          ? "VIDEO"
          : item.media_type === "CAROUSEL_ALBUM"
          ? "CAROUSEL_ALBUM"
          : "IMAGE",
      media_url: item.media_url ?? "",
      thumbnail_url: item.thumbnail_url ?? item.media_url ?? "",
      permalink: item.permalink ?? "",
      timestamp: item.timestamp ?? "",
    }));
}

async function fetchThreadsDirectly() {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) return [];

  const params = new URLSearchParams({
    fields: "id,text,media_type,media_url,thumbnail_url,permalink,timestamp",
    limit: "8",
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
      console.error("Social feed direct Threads fallback failed", {
        status: response.status,
        code: data?.error?.code,
        subcode: data?.error?.error_subcode,
        type: data?.error?.type,
        message: data?.error?.message,
      });
      return [];
    }

    return normalizeThreadsItems(data?.data ?? []);
  } catch (error) {
    console.error("Social feed direct Threads fallback errored", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const [instagramResult, youtubeResult, threadsResult] =
      await Promise.allSettled([
        fetchPosts(origin, "/api/social/instagram"),
        fetchPosts(origin, "/api/social/youtube"),
        fetchPosts(origin, "/api/social/threads"),
      ]);
    const instagramPosts =
      instagramResult.status === "fulfilled" ? instagramResult.value : [];
    const youtubePosts =
      youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    let threadsPosts =
      threadsResult.status === "fulfilled" ? threadsResult.value : [];
    if (!threadsPosts.length) {
      threadsPosts = await fetchThreadsDirectly();
    }
    const mergedPosts = uniqueLatestPosts([
      ...instagramPosts,
      ...youtubePosts,
      ...threadsPosts,
    ]);

    console.log("social counts", {
      instagram: instagramPosts.length,
      youtube: youtubePosts.length,
      threads: threadsPosts.length,
      merged: mergedPosts.length,
    });

    return NextResponse.json({
      posts: mergedPosts,
    });
  } catch (error) {
    console.error("Social feed aggregation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
