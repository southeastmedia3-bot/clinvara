function normalizeText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function postMedia(post) {
  if (post.media_type === "VIDEO") {
    return post.thumbnail_url || post.media_url || "";
  }

  return post.media_url || post.thumbnail_url || "";
}

function postTime(post) {
  const time = Date.parse(post.timestamp || "");
  return Number.isFinite(time) ? time : 0;
}

function uniqueLatestSocialPosts(posts) {
  const seen = new Set();

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

function normalizeInstagramMedia(items = []) {
  return items.map((item) => ({
    id: item.id,
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

function normalizeYouTubeItems(items = []) {
  return items
    .filter((item) => item.id?.videoId && item.snippet?.title)
    .map((item) => {
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

function normalizeThreadsItems(items = []) {
  return items.map((item) => ({
    id: item.id,
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

async function fetchJson(url, label) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || data?.message || response.statusText;
    const error = {
      status: response.status,
      message,
      code: data?.error?.code,
      type: data?.error?.type,
    };
    console.error(`[CLINVARA social] ${label} failed`, {
      status: error.status,
      message: error.message,
      code: error.code,
      type: error.type,
    });
    return { data: null, error };
  }

  return { data, error: null };
}

async function checkInstagramToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return { ok: false, error: "INSTAGRAM_ACCESS_TOKEN is not set." };
  }

  const params = new URLSearchParams({
    fields: "id,username",
    access_token: token,
  });
  const { data, error } = await fetchJson(
    `https://graph.instagram.com/me?${params.toString()}`,
    "Instagram token check",
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id, username: data?.username };
}

async function getInstagramFeed() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  console.info("[CLINVARA social] Instagram token configured", {
    configured: Boolean(token),
  });

  if (!token) {
    return {
      posts: [],
      error: {
        message: "INSTAGRAM_ACCESS_TOKEN is not set.",
      },
    };
  }

  const params = new URLSearchParams({
    fields: "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp",
    limit: "7",
    access_token: token,
  });
  const { data, error } = await fetchJson(
    `https://graph.instagram.com/me/media?${params.toString()}`,
    "Instagram media",
  );

  if (error) {
    return {
      posts: [],
      error,
    };
  }

  return {
    posts: normalizeInstagramMedia(data?.data || []),
    error: null,
  };
}

async function fetchInstagramPosts() {
  const payload = await getInstagramFeed();

  return {
    posts: payload.posts || [],
    error: payload.error?.message || null,
  };
}

async function fetchYouTubePosts() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || "UCi5HxfxaBwjAGqXEbWT_QYQ";
  if (!apiKey || !channelId) return [];

  const params = new URLSearchParams({
    key: apiKey,
    channelId,
    part: "snippet",
    order: "date",
    maxResults: "7",
    type: "video",
  });
  const { data } = await fetchJson(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    "YouTube",
  );

  return normalizeYouTubeItems(data?.items || []);
}

async function fetchThreadsPosts() {
  const token = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID || "27341858908836757";
  if (!token || !userId) return [];

  const params = new URLSearchParams({
    fields: "id,text,media_type,media_url,thumbnail_url,permalink,timestamp",
    access_token: token,
  });
  const { data } = await fetchJson(
    `https://graph.threads.net/v1.0/${userId}/threads?${params.toString()}`,
    "Threads",
  );

  return normalizeThreadsItems(data?.data || []);
}

async function getSocialFeed() {
  const [instagramResult, youtubeResult, threadsResult] = await Promise.allSettled([
    fetchInstagramPosts(),
    fetchYouTubePosts(),
    fetchThreadsPosts(),
  ]);
  const instagramPayload =
    instagramResult.status === "fulfilled"
      ? instagramResult.value
      : { posts: [], error: "Instagram request failed." };
  const instagram = instagramPayload.posts || [];
  const youtube = youtubeResult.status === "fulfilled" ? youtubeResult.value : [];
  const threads = threadsResult.status === "fulfilled" ? threadsResult.value : [];
  const posts = uniqueLatestSocialPosts([...instagram, ...youtube, ...threads]);

  return {
    posts,
  };
}

module.exports = {
  checkInstagramToken,
  getInstagramFeed,
  getSocialFeed,
};
