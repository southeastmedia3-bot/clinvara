import { NextResponse } from "next/server";

const channelId = "UCi5HxfxaBwjAGqXEbWT_QYQ";

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

  if (!apiKey) {
    return NextResponse.json({ videos: [] }, { status: 200 });
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
      return NextResponse.json({ videos: [] }, { status: 200 });
    }

    const data = (await response.json()) as { items?: YouTubeSearchItem[] };
    const videos =
      data.items
        ?.filter((item) => item.id?.videoId && item.snippet?.title)
        .map((item) => ({
          id: item.id?.videoId,
          title: item.snippet?.title,
          description: item.snippet?.description ?? "",
          publishedAt: item.snippet?.publishedAt ?? "",
          thumbnail:
            item.snippet?.thumbnails?.high?.url ??
            item.snippet?.thumbnails?.medium?.url ??
            "",
          href: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
        })) ?? [];

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] }, { status: 200 });
  }
}
