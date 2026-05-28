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
  posts?: SocialPost[];
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

    return Array.isArray(data?.posts) ? data.posts : [];
  } catch (error) {
    console.error("Social feed source failed", {
      path,
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
    const threadsPosts =
      threadsResult.status === "fulfilled" ? threadsResult.value : [];
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
