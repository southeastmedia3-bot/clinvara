import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 60 * 15;

type FacebookPost = {
  id?: string;
  message?: string;
  full_picture?: string;
  picture?: string;
  permalink_url?: string;
  created_time?: string;
};

type FacebookResponse = {
  data?: FacebookPost[];
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

function uniqueFacebookPosts(posts: FacebookPost[]) {
  return Array.from(
    new Map(
      posts.map((post) => [
        post.permalink_url ||
          post.id ||
          post.full_picture ||
          `${cleanText(post.message)}-${post.created_time ?? ""}`,
        post,
      ]),
    ).values(),
  );
}

export async function GET() {
  const accessToken =
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN ?? process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken || !pageId) {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }

  const params = new URLSearchParams({
    fields: "id,message,full_picture,picture,permalink_url,created_time",
    limit: "8",
    access_token: accessToken,
  });

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/posts?${params.toString()}`,
      { next: { revalidate: 60 * 15 } },
    );
    const data = (await response.json().catch(() => null)) as
      | FacebookResponse
      | null;

    if (!response.ok) {
      console.error("Facebook social feed API error", {
        status: response.status,
        code: data?.error?.code,
        subcode: data?.error?.error_subcode,
        type: data?.error?.type,
        message: data?.error?.message,
      });
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const posts = uniqueFacebookPosts(data?.data ?? [])
      .filter((post) => post.id && post.permalink_url)
      .slice(0, 8)
      .map((post) => ({
        id: post.id,
        platform: "facebook",
        caption: cleanText(post.message),
        media_type: "IMAGE",
        media_url: post.full_picture ?? post.picture ?? "",
        thumbnail_url: post.full_picture ?? post.picture ?? "",
        permalink: post.permalink_url,
        timestamp: post.created_time ?? "",
      }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Facebook social feed request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
