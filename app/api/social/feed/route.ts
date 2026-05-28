import { NextResponse } from "next/server";

type SocialPost = {
  id: string;
  platform: "instagram" | "facebook" | "youtube" | "threads";
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
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
    .slice(0, 5);
}

async function fetchPosts(origin: string, path: string) {
  const response = await fetch(`${origin}${path}`, {
    next: { revalidate: 60 * 10 },
  });
  const data = (await response.json().catch(() => null)) as SocialApiResponse | null;
  return Array.isArray(data?.posts) ? data.posts : [];
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const [instagramResult, youtubeResult, facebookResult, threadsResult] =
      await Promise.allSettled([
        fetchPosts(origin, "/api/social/instagram"),
        fetchPosts(origin, "/api/social/youtube"),
        fetchPosts(origin, "/api/social/facebook"),
        fetchPosts(origin, "/api/social/threads"),
      ]);
    const instagramPosts =
      instagramResult.status === "fulfilled" ? instagramResult.value : [];
    const youtubePosts =
      youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
    const facebookPosts =
      facebookResult.status === "fulfilled" ? facebookResult.value : [];
    const threadsPosts =
      threadsResult.status === "fulfilled" ? threadsResult.value : [];

    return NextResponse.json({
      posts: uniqueLatestPosts([
        ...instagramPosts,
        ...youtubePosts,
        ...facebookPosts,
        ...threadsPosts,
      ]),
    });
  } catch (error) {
    console.error("Social feed aggregation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
