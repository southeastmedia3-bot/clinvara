"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Instagram, MessageCircle, Play } from "lucide-react";

type SocialPlatform = "instagram" | "threads" | "youtube" | string;

type SocialPost = {
  id: string;
  platform: SocialPlatform;
  title?: string;
  caption?: string;
  thumbnail_url?: string;
  media_url?: string;
  permalink: string;
  timestamp: string;
  media_type?: string;
};

type SocialApiResponse = {
  posts?: SocialPost[];
  error?: {
    message?: string;
  } | null;
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
  if (platform === "threads") return "Threads";
  if (platform === "youtube") return "YouTube";
  return "Instagram";
}

function platformCta(platform: SocialPlatform) {
  if (platform === "threads") return "View Thread";
  if (platform === "youtube") return "Watch Video";
  return "View Post";
}

function platformTitle(post: SocialPost) {
  const title = post.title || "";
  if (title.trim()) return title.trim();
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
  const time = Date.parse(post.timestamp || "");
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
        ? `caption-time:${normalizeText(post.caption || "")}:${post.timestamp}`
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

function toCard(post: SocialPost): SocialCard {
  const caption = post.caption || post.title || "";

  return {
    id: `${post.platform}-${post.id || post.permalink}`,
    platform: post.platform,
    label: platformLabel(post.platform),
    title: platformTitle(post),
    caption: caption.length > 100 ? `${caption.slice(0, 100).trim()}...` : caption,
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

function socialFeedUrl() {
  return (
    process.env.NEXT_PUBLIC_SOCIAL_FEED_URL ||
    "https://asia-south1-clinvara-f6235.cloudfunctions.net/api/social/feed"
  );
}

function formattedTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function CardMedia({ card }: { card: SocialCard }) {
  if (!card.image) return null;

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
  const url = socialFeedUrl();
  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json().catch(() => null)) as SocialApiResponse | null;

  if (!response.ok) {
    throw new Error(
      `Social feed failed at ${url}: ${response.status} ${response.statusText}`,
    );
  }

  if (data?.error?.message) {
    throw new Error(data.error.message);
  }

  return Array.isArray(data?.posts) ? data.posts : [];
}

export function SocialFeedStrip() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const nextPosts = await fetchSocialFeed();

        if (!active) return;
        setPosts(nextPosts);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Social feed could not be loaded.";

        console.error("CLINVARA social feed error", message);

        if (!active) return;
        setPosts([]);
      } finally {
        if (active) setLoaded(true);
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(() => {
    return sortAndLimit(posts);
  }, [posts]);

  const duplicatedCards = useMemo(() => [...cards, ...cards], [cards]);

  useEffect(() => {
    const track = scrollRef.current;
    if (!track || cards.length < 2 || isPaused) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    let frameId = 0;
    let previousTime = performance.now();

    function animate(currentTime: number) {
      if (!track) return;

      const halfWidth = track.scrollWidth / 2;

      if (halfWidth <= 0) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - previousTime;
      previousTime = currentTime;
      track.scrollLeft += elapsed * 0.05;

      if (track.scrollLeft >= halfWidth) {
        track.scrollLeft -= halfWidth;
      }

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
          <>

          <style>{`
            .social-scroll {
              display: flex;
              gap: 1.5rem;
              overflow-x: auto;
              overflow-y: hidden;
              scroll-behavior: auto;
              scrollbar-width: none;
              -ms-overflow-style: none;
            }

            .social-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
            <div
              ref={scrollRef}
              className="social-scroll flex gap-6 overflow-x-auto overflow-y-hidden"
              aria-label="Latest CLINVARA social posts"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {duplicatedCards.map((card, index) => {
                const Icon = platformIcon(card.platform);

                return (
                  <Link
                    key={`${card.id}-${index}`}
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

                      {card.timestamp && (
                        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--brand-text-muted)]">
                          {formattedTimestamp(card.timestamp)}
                        </p>
                      )}

                      <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-[0.12em] underline underline-offset-4">
                        {card.cta}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {loaded && cards.length === 0 && (
          <p className="max-w-2xl text-sm text-[var(--brand-text-muted)]">
            Social posts could not be loaded right now. Please refresh after the
            social feed tokens are updated.
          </p>
        )}
      </div>
    </section>
  );
}