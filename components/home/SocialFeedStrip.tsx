"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { socialLinks } from "@/lib/data/socialLinks";

type SocialPost = {
  id: string;
  platform: "instagram" | "youtube";
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

type FeedItem = {
  platform: "Instagram" | "Facebook" | "YouTube";
  title: string;
  body: string;
  href: string;
  cta: string;
  image?: string;
  sourceKey?: string;
};

type SocialApiResponse = {
  posts?: SocialPost[];
};

function platformIcon(platform: string) {
  return socialLinks.find((social) => social.platform === platform)?.icon;
}

function platformLabel(platform: SocialPost["platform"]): FeedItem["platform"] {
  return platform === "youtube" ? "YouTube" : "Instagram";
}

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
      return Boolean(post.permalink && image);
    })
    .sort((a, b) => postTime(b) - postTime(a))
    .slice(0, 5);
}

const staticFallbackFeed: FeedItem[] = [
  {
    platform: "Instagram",
    title: "Follow @clinvaraglobal",
    body: "Daily clinical skincare rituals, product textures, and launch notes from CLINVARA.",
    href: socialLinks[0].href,
    cta: "Open Instagram",
    sourceKey: "fallback-follow",
  },
  {
    platform: "Instagram",
    title: "Clinical skincare routines",
    body: "Simple cleanse, treat, moisturize, and protect routines for consistent skin support.",
    href: "/routines",
    cta: "Explore routines",
    sourceKey: "fallback-routines",
  },
  {
    platform: "Instagram",
    title: "New launches coming soon",
    body: "Follow CLINVARA for product drops, formulation updates, and early access notes.",
    href: socialLinks[0].href,
    cta: "Follow now",
    sourceKey: "fallback-launches",
  },
  {
    platform: "Instagram",
    title: "Ingredient transparency",
    body: "Clear ingredient education for actives, barrier support, hydration, and tone care.",
    href: "/blog",
    cta: "Read journal",
    sourceKey: "fallback-ingredients",
  },
  {
    platform: "YouTube",
    title: "Skincare education",
    body: "Watch CLINVARA explainers for routines, actives, and barrier-focused skincare.",
    href: socialLinks[2].href,
    cta: "Open YouTube",
    sourceKey: "fallback-youtube",
  },
];

function uniqueFeedItems(items: FeedItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const keys = [
      item.sourceKey ? `source:${item.sourceKey}` : "",
      item.image ? `image:${item.image}` : "",
      item.href && !item.sourceKey ? `href:${item.href}` : "",
      item.body ? `body:${normalizedText(item.body)}` : "",
      item.title ? `title:${normalizedText(item.title)}` : "",
    ].filter(Boolean);

    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

function toFeedItem(post: SocialPost): FeedItem {
  return {
    platform: platformLabel(post.platform),
    title:
      post.platform === "youtube"
        ? "Latest YouTube Video"
        : post.media_type === "VIDEO"
        ? "Latest Instagram Reel"
        : "Latest Instagram Post",
    body:
      post.caption ||
      "Follow CLINVARA for skincare routines, launch updates, and product education.",
    href: post.permalink,
    cta: post.platform === "youtube" ? "Watch video" : "View on Instagram",
    image: postImage(post),
    sourceKey: `${post.platform}-${post.id || post.permalink}`,
  };
}

function buildDisplayPosts(realPosts: SocialPost[]) {
  const uniqueRealPosts = uniqueLatestPosts(realPosts);
  const liveItems = uniqueRealPosts.map(toFeedItem);
  const fallbackFillers = staticFallbackFeed.filter(
    (fallback) =>
      !liveItems.some(
        (item) =>
          item.href === fallback.href ||
          normalizedText(item.body) === normalizedText(fallback.body) ||
          normalizedText(item.title) === normalizedText(fallback.title),
      ),
  );

  return uniqueFeedItems([...liveItems, ...fallbackFillers]).slice(0, 5);
}

export function SocialFeedStrip() {
  const [realPosts, setRealPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    let active = true;

    async function loadSocialPosts() {
      const [instagramResult, youtubeResult] = await Promise.allSettled([
        fetch("/api/social/instagram", { cache: "no-store" }).then(
          (response) => response.json() as Promise<SocialApiResponse>,
        ),
        fetch("/api/social/youtube", { cache: "no-store" }).then(
          (response) => response.json() as Promise<SocialApiResponse>,
        ),
      ]);

      if (!active) return;

      const instagramPosts =
        instagramResult.status === "fulfilled" &&
        Array.isArray(instagramResult.value.posts)
          ? instagramResult.value.posts
          : [];
      const youtubePosts =
        youtubeResult.status === "fulfilled" &&
        Array.isArray(youtubeResult.value.posts)
          ? youtubeResult.value.posts
          : [];

      setRealPosts(uniqueLatestPosts([...instagramPosts, ...youtubePosts]));
    }

    void loadSocialPosts();

    return () => {
      active = false;
    };
  }, []);

  const feedItems = useMemo(
    () => buildDisplayPosts(realPosts),
    [realPosts],
  );
  const displayPosts = feedItems;
  const animationPosts = displayPosts;

  return (
    <section className="border-y border-[var(--brand-border)] bg-[var(--brand-off-white)] py-12">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-text-muted)]">
              Social
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              From CLINVARA Social
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <Link
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-black/15 bg-white px-4 text-xs font-semibold uppercase tracking-[0.1em] transition hover:border-black"
              >
                <social.icon className="h-4 w-4" />
                {social.platform}
              </Link>
            ))}
          </div>
        </div>

        <div className="social-marquee pb-3">
          <div className="social-marquee-track gap-4">
            {animationPosts.map((item, index) => {
              const Icon = platformIcon(item.platform);
              return (
                <Link
                  key={`${item.platform}-${item.title}-${index}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-48 w-[78vw] max-w-[410px] shrink-0 flex-col justify-between rounded-lg border border-[var(--brand-border)] bg-white p-5 transition hover:border-black sm:w-[360px] lg:w-[410px]"
                  aria-hidden={index >= displayPosts.length}
                  tabIndex={index >= displayPosts.length ? -1 : 0}
                >
                  <div>
                    {item.image && (
                      <div className="mb-5 aspect-video overflow-hidden rounded-md bg-[var(--brand-light-gray)]">
                        <img
                          src={item.image}
                          alt={`${item.title} thumbnail`}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                        {Icon && <Icon className="h-4 w-4 text-black" />}
                        {item.platform}
                      </span>
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-semibold leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                      {item.body.length > 132
                        ? `${item.body.slice(0, 132)}...`
                        : item.body}
                    </p>
                  </div>
                  <span className="mt-7 text-xs font-semibold uppercase tracking-[0.12em] underline underline-offset-4">
                    {item.cta}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
