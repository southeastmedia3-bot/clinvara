import { NextResponse } from "next/server";

const fallbackChannelId = "UCi5HxfxaBwjAGqXEbWT_QYQ";

type YouTubeSearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: {
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
};

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? fallbackChannelId;

  if (!apiKey) {
    return NextResponse.json({ posts: [], videos: [] }, { status: 200 });
  }

  const params = new URLSearchParams({
    key: apiKey,
    channelId,
    part: "snippet",
    order: "date",
    maxResults: "6",
    type: "video",
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      { next: { revalidate: 60 * 30 } },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("YouTube API error", {
        status: response.status,
        message:
          typeof errorData === "object" && errorData !== null
            ? JSON.stringify(errorData)
            : "Unknown error",
      });
      return NextResponse.json({ posts: [], videos: [] }, { status: 200 });
    }

    const data = (await response.json()) as { items?: YouTubeSearchItem[] };
    const posts =
      data.items
        ?.filter((item) => item.id?.videoId && item.snippet?.title)
        .map((item) => ({
          id: item.id?.videoId,
          platform: "youtube",
          title: item.snippet?.title ?? "Latest YouTube Video",
          caption: item.snippet?.description || item.snippet?.title || "",
          media_url:
            item.snippet?.thumbnails?.high?.url ??
            item.snippet?.thumbnails?.medium?.url ??
            "",
          thumbnail_url:
            item.snippet?.thumbnails?.high?.url ??
            item.snippet?.thumbnails?.medium?.url ??
            "",
          permalink: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
          timestamp: item.snippet?.publishedAt ?? "",
          media_type: "VIDEO",
        })) ?? [];

    return NextResponse.json({ posts, videos: posts });
  } catch (error) {
    console.error("YouTube API request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [], videos: [] }, { status: 200 });
  }
}
