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
      const keys = [
        `${post.platform}:id:${post.id}`,
        `permalink:${post.permalink}`,
        `media:${post.media_url}`,
        `caption-time:${normalizedText(post.caption)}:${post.timestamp}`,
      ].filter((key) => !key.endsWith(":") && !key.endsWith("::"));

      if (keys.some((key) => seen.has(key))) return false;
      keys.forEach((key) => seen.add(key));
      return Boolean(post.permalink && postImage(post));
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
  },
  {
    platform: "Instagram",
    title: "Clinical skincare routines",
    body: "Simple cleanse, treat, moisturize, and protect routines for consistent skin support.",
    href: "/routines",
    cta: "Explore routines",
  },
  {
    platform: "Instagram",
    title: "New launches coming soon",
    body: "Follow CLINVARA for product drops, formulation updates, and early access notes.",
    href: socialLinks[0].href,
    cta: "Follow now",
  },
  {
    platform: "Instagram",
    title: "Ingredient transparency",
    body: "Clear ingredient education for actives, barrier support, hydration, and tone care.",
    href: "/blog",
    cta: "Read journal",
  },
];

function uniqueFeedItems(items: FeedItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const keys = [
      `href:${item.href}`,
      `image:${item.image ?? ""}`,
      `body:${normalizedText(item.body)}`,
      `title:${normalizedText(item.title)}`,
    ].filter((key) => !key.endsWith(":"));

    if (keys.some((key) => seen.has(key))) return false;
    keys.forEach((key) => seen.add(key));
    return true;
  });
}

export function SocialFeedStrip() {
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    let active = true;

    void Promise.allSettled([
      fetch("/api/social/instagram")
        .then((response) => response.json())
        .then((data) => {
          if (!active || !Array.isArray(data?.posts)) return;
          setPosts((current) => uniqueLatestPosts([...current, ...data.posts]));
        }),
      fetch("/api/social/youtube")
        .then((response) => response.json())
        .then((data) => {
          if (!active || !Array.isArray(data?.posts)) return;
          setPosts((current) => uniqueLatestPosts([...current, ...data.posts]));
        }),
    ]);

    return () => {
      active = false;
    };
  }, []);

  const feedItems = useMemo(
    (): FeedItem[] => {
      const liveItems = uniqueLatestPosts(posts).map((post) => ({
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
      } satisfies FeedItem));

      return uniqueFeedItems(
        liveItems.length
          ? [...liveItems, ...staticFallbackFeed]
          : staticFallbackFeed,
      ).slice(0, 5);
    },
    [posts],
  );
  const shouldLoop = feedItems.length >= 5;
  const marqueeItems = shouldLoop ? [...feedItems, ...feedItems] : feedItems;

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

        <div className="social-marquee -mx-4 px-4 pb-3">
          <div className="social-marquee-track gap-4">
            {marqueeItems.map((item, index) => {
              const Icon = platformIcon(item.platform);
              return (
                <Link
                  key={`${item.platform}-${item.title}-${index}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex min-h-48 w-[78vw] max-w-[410px] shrink-0 flex-col justify-between rounded-lg border border-[var(--brand-border)] bg-white p-5 transition hover:border-black sm:w-[360px] lg:w-[410px]"
                  aria-hidden={index >= feedItems.length}
                  tabIndex={index >= feedItems.length ? -1 : 0}
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
