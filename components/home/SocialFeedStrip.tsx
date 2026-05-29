"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Instagram, MessageCircle, Play } from "lucide-react";
import { apiUrl } from "@/lib/api/client";

type SocialPlatform = "instagram" | "youtube" | "threads";

type SocialPost = {
  id: string;
  platform: SocialPlatform;
  title?: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "TEXT";
  media_url?: string | null;
  thumbnail_url?: string | null;
  permalink: string;
  timestamp: string;
};

type SocialApiResponse = {
  posts?: SocialPost[];
  diagnostics?: unknown;
};

type SocialCard = {
  id: string;
  platform: SocialPlatform;
  label: string;
  title: string;
  caption: string;
  image?: string;
  href: string;
  cta: string;
  timestamp: string;
};

function platformLabel(platform: SocialPlatform) {
  if (platform === "youtube") return "YouTube";
  if (platform === "threads") return "Threads";
  return "Instagram";
}

function platformCta(platform: SocialPlatform) {
  if (platform === "youtube") return "Watch Video";
  if (platform === "threads") return "View Thread";
  return "View Post";
}

function platformTitle(post: SocialPost) {
  if (post.title?.trim()) return post.title.trim();
  if (post.platform === "youtube") return "Latest YouTube Video";
  if (post.platform === "threads") return "Latest Thread";
  if (post.media_type === "VIDEO") return "Latest Instagram Reel";
  return "Latest Instagram Post";
}

function platformIcon(platform: SocialPlatform) {
  if (platform === "youtube") return Play;
  if (platform === "threads") return MessageCircle;
  return Instagram;
}

function postImage(post: SocialPost) {
  if (post.media_type === "VIDEO") {
    return post.thumbnail_url || post.media_url || undefined;
  }

  return post.thumbnail_url || post.media_url || undefined;
}

function postTime(post: Pick<SocialPost, "timestamp">) {
  const time = Date.parse(post.timestamp);
  return Number.isFinite(time) ? time : 0;
}

function normalizeText(value = "") {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function uniquePosts(posts: SocialPost[]) {
  const seen = new Set<string>();

  return posts.filter((post) => {
    const image = postImage(post);
    const keys = [
      post.id ? `${post.platform}:id:${post.id}` : "",
      post.permalink ? `permalink:${post.permalink}` : "",
      image ? `media:${image}` : "",
      post.caption || post.timestamp
        ? `caption-time:${normalizeText(post.caption)}:${post.timestamp}`
        : "",
    ].filter(Boolean);

    if (!post.permalink || keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return Boolean(image || post.caption || post.title);
  });
}

function SkeletonCard() {
  return (
    <div className="social-card w-[78vw] max-w-[360px] shrink-0 rounded-xl border border-[var(--brand-border)] bg-white p-3 sm:w-[320px]">
      <div className="skeleton aspect-[4/5] rounded-lg" />
      <div className="p-2 pt-4">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton mt-4 h-7 w-44 rounded" />
        <div className="skeleton mt-3 h-4 w-full rounded" />
        <div className="skeleton mt-2 h-4 w-4/5 rounded" />
      </div>
    </div>
  );
}

const placeholderCards: SocialCard[] = [
  {
    id: "instagram-placeholder-1",
    platform: "instagram",
    label: "Instagram",
    title: "Routine updates",
    caption:
      "Follow CLINVARA on Instagram for product textures, launch notes, and skincare routines.",
    href: "https://www.instagram.com/clinvaraglobal/",
    cta: "View Post",
    timestamp: "",
  },
  {
    id: "instagram-placeholder-2",
    platform: "instagram",
    label: "Instagram",
    title: "Ingredient notes",
    caption:
      "Explore clinical skincare education and ingredient transparency from CLINVARA.",
    href: "https://www.instagram.com/clinvaraglobal/",
    cta: "View Post",
    timestamp: "",
  },
  {
    id: "instagram-placeholder-3",
    platform: "instagram",
    label: "Instagram",
    title: "Launch stories",
    caption:
      "See the latest CLINVARA launches and routine tips directly on Instagram.",
    href: "https://www.instagram.com/clinvaraglobal/",
    cta: "View Post",
    timestamp: "",
  },
];


function toCard(post: SocialPost): SocialCard {
  return {
    id: `${post.platform}-${post.id || post.permalink}`,
    platform: post.platform,
    label: platformLabel(post.platform),
    title: platformTitle(post),
    caption:
      post.caption ||
      "Follow CLINVARA for skincare routines, launch updates, and product education.",
    image: postImage(post),
    href: post.permalink,
    cta: platformCta(post.platform),
    timestamp: post.timestamp,
  };
}

function sortAndLimit(posts: SocialPost[]) {
  return uniquePosts(posts)
    .sort((a, b) => postTime(b) - postTime(a))
    .slice(0, 7)
    .map(toCard);
}

function CardMedia({ card }: { card: SocialCard }) {
  if (!card.image) {
    return (
      <div className="flex aspect-[4/5] items-end rounded-lg bg-[var(--brand-light-gray)] p-5">
        <p className="font-display text-3xl font-semibold leading-none">
          CLINVARA
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-[4/5] overflow-hidden rounded-lg bg-[var(--brand-light-gray)]">
      <img
        src={card.image}
        alt={`${card.label} post thumbnail`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      />
    </div>
  );
}

async function fetchSocialFeed() {
  const primaryUrl = apiUrl("/api/social/feed");
  const urls =
    primaryUrl === "/api/social/feed"
      ? [primaryUrl]
      : [primaryUrl, "/api/social/feed"];

  const errors: string[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as
        | SocialApiResponse
        | null;

      if (!response.ok) {
        const message = `Social feed failed at ${url}: ${response.status} ${response.statusText}`;
        console.error(message, data);
        errors.push(message);
        continue;
      }

      if (data?.diagnostics) {
        console.log("CLINVARA social feed diagnostics", data.diagnostics);
      }

      return Array.isArray(data?.posts) ? data.posts : [];
    } catch (error) {
      const message = `Social feed request failed at ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(message);
      errors.push(message);
    }
  }

  console.error("CLINVARA social feed unavailable", errors);
  return [];
}

export function SocialFeedStrip() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      const nextPosts = await fetchSocialFeed();

      if (!active) return;

      setPosts(nextPosts);
      setLoaded(true);
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(() => {
    const liveCards = sortAndLimit(posts);
    return liveCards.length ? liveCards : loaded ? placeholderCards : [];
  }, [loaded, posts]);

  useEffect(() => {
    const track = scrollRef.current;
    if (!track || cards.length < 2 || isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    let frameId = 0;
    let direction = 1;
    let previousTime = performance.now();

    function animate(currentTime: number) {
      if (!track) return;

      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - previousTime;
      previousTime = currentTime;
      track.scrollLeft += direction * elapsed * 0.025;

      if (track.scrollLeft >= maxScroll - 1) direction = -1;
      if (track.scrollLeft <= 1) direction = 1;

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [cards.length, isPaused]);

  return (
    <section className="border-y border-[var(--brand-border)] bg-[var(--brand-off-white)] py-14">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
            Socials
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold leading-tight md:text-5xl">
            As Seen on Social
          </h2>
        </div>

        {!loaded && (
          <div className="social-scroll" aria-label="Loading latest CLINVARA social posts">
            {[0, 1, 2, 3].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        )}

        {loaded && cards.length > 0 && (
          <div
            ref={scrollRef}
            className="social-scroll"
            aria-label="Latest CLINVARA social posts"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
          >
            {cards.map((card) => {
              const Icon = platformIcon(card.platform);

              return (
                <Link
                  key={card.id}
                  href={card.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group social-card block w-[78vw] max-w-[360px] shrink-0 rounded-xl border border-[var(--brand-border)] bg-white p-3 transition hover:-translate-y-1 hover:border-black sm:w-[320px]"
                >
                  <CardMedia card={card} />
                  <div className="p-2 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                        <Icon className="h-4 w-4 text-black" />
                        {card.label}
                      </span>
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold leading-tight">
                      {card.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                      {card.caption}
                    </p>
                    <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.12em] underline underline-offset-4">
                      {card.cta}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
