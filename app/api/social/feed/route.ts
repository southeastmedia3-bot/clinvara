import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SocialPlatform = "instagram" | "youtube" | "threads";

type SocialPost = {
  id: string;
  platform: SocialPlatform;
  title: string;
  caption: string;
  thumbnail_url: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "TEXT";
};

function normalizeText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function postMedia(post: SocialPost) {
  return post.media_type === "VIDEO"
    ? post.thumbnail_url || post.media_url
    : post.media_url || post.thumbnail_url;
}

function postTime(post: SocialPost) {
  const time = Date.parse(post.timestamp);
  return Number.isFinite(time) ? time : 0;
}

function uniqueLatestPosts(posts: SocialPost[]) {
  const seen = new Set<string>();

  return posts
    .filter((post) => {
      const media = postMedia(post);
      const keys = [
        post.id ? `${post.platform}:id:${post.id}` : "",
        post.permalink ? `permalink:${post.permalink}` : "",
        media ? `media:${media}` : "",
      ].filter(Boolean);

      if (!post.id || !post.permalink || keys.some((key) => seen.has(key))) {
        return false;
      }

      keys.forEach((key) => seen.add(key));
      return Boolean(media || post.caption || post.title);
    })
    .sort((a, b) => postTime(b) - postTime(a))
    .slice(0, 7);
}

async function fetchJson(url: string, label: string) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(`Social feed ${label} failed`, {
      status: response.status,
      message: data?.error?.message || data?.message || response.statusText,
      code: data?.error?.code,
      type: data?.error?.type,
    });
    return null;
  }

  return data;
}

async function fetchInstagramPosts(): Promise<SocialPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  const params = new URLSearchParams({
    fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
    access_token: token,
  });
  const data = await fetchJson(
    `https://graph.instagram.com/me/media?${params.toString()}`,
    "Instagram",
  );

  return (data?.data ?? []).map((item: any) => ({
    id: item.id ?? "",
    platform: "instagram",
    title:
      item.media_type === "VIDEO"
        ? "Latest Instagram Reel"
        : "Latest Instagram Post",
    caption: normalizeText(item.caption),
    thumbnail_url:
      item.media_type === "VIDEO"
        ? item.thumbnail_url || item.media_url || ""
        : item.media_url || "",
    media_url: item.media_url || item.thumbnail_url || "",
    permalink: item.permalink || "",
    timestamp: item.timestamp || "",
    media_type: item.media_type || "IMAGE",
  }));
}

async function fetchYouTubePosts(): Promise<SocialPost[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!apiKey || !channelId) return [];

  const params = new URLSearchParams({
    key: apiKey,
    channelId,
    part: "snippet",
    order: "date",
    maxResults: "7",
    type: "video",
  });
  const data = await fetchJson(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    "YouTube",
  );

  return (data?.items ?? [])
    .filter((item: any) => item.id?.videoId && item.snippet?.title)
    .map((item: any) => {
      const thumbnail =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "";

      return {
        id: item.id.videoId,
        platform: "youtube",
        title: item.snippet.title,
        caption: normalizeText(item.snippet.description || item.snippet.title),
        thumbnail_url: thumbnail,
        media_url: thumbnail,
        permalink: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        timestamp: item.snippet.publishedAt || "",
        media_type: "VIDEO",
      };
    });
}

async function fetchThreadsPosts(): Promise<SocialPost[]> {
  const token = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;
  if (!token || !userId) return [];

  const params = new URLSearchParams({
    fields: "id,text,media_type,media_url,thumbnail_url,permalink,timestamp",
    access_token: token,
  });
  const data = await fetchJson(
    `https://graph.threads.net/v1.0/${userId}/threads?${params.toString()}`,
    "Threads",
  );

  return (data?.data ?? []).map((item: any) => ({
    id: item.id ?? "",
    platform: "threads",
    title: "Latest Thread",
    caption: normalizeText(item.text),
    thumbnail_url: item.thumbnail_url || item.media_url || "",
    media_url: item.media_url || item.thumbnail_url || "",
    permalink: item.permalink || "",
    timestamp: item.timestamp || "",
    media_type: item.media_type || "TEXT",
  }));
}

export async function GET() {
  try {
    const [instagramResult, youtubeResult, threadsResult] =
      await Promise.allSettled([
        fetchInstagramPosts(),
        fetchYouTubePosts(),
        fetchThreadsPosts(),
      ]);
    const instagram =
      instagramResult.status === "fulfilled" ? instagramResult.value : [];
    const youtube =
      youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    const threads =
      threadsResult.status === "fulfilled" ? threadsResult.value : [];

    return NextResponse.json({
      posts: uniqueLatestPosts([...instagram, ...youtube, ...threads]),
    });
  } catch (error) {
    console.error("Social feed route failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
