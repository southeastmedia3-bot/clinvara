"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { socialFeed, socialLinks } from "@/lib/data/socialLinks";

type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  href: string;
};

type InstagramPost = {
  id: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  image: string;
  href: string;
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

export function SocialFeedStrip() {
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    let active = true;

    void Promise.allSettled([
      fetch("/api/social/instagram")
        .then((response) => response.json())
        .then((data) => {
          if (!active || !Array.isArray(data?.posts)) return;
          setInstagramPosts(data.posts);
        }),
      fetch("/api/social/youtube")
        .then((response) => response.json())
        .then((data) => {
          if (!active || !Array.isArray(data?.videos)) return;
          setYoutubeVideos(data.videos);
        }),
    ]);

    return () => {
      active = false;
    };
  }, []);

  const feedItems = useMemo(
    (): FeedItem[] => [
      ...instagramPosts.map((post) => ({
        platform: "Instagram" as const,
        title:
          post.mediaType === "VIDEO"
            ? "Latest Instagram Reel"
            : "Latest Instagram Post",
        body:
          post.caption ||
          "Follow CLINVARA for skincare routines, launch updates, and product education.",
        href: post.href,
        cta: "View on Instagram",
        image: post.image,
      } satisfies FeedItem)),
      ...youtubeVideos.map((video) => ({
        platform: "YouTube" as const,
        title: video.title,
        body: video.description || "Watch the latest CLINVARA skincare video.",
        href: video.href,
        cta: "Watch video",
        image: video.thumbnail,
      } satisfies FeedItem)),
      ...socialFeed,
    ],
    [instagramPosts, youtubeVideos],
  );
  const marqueeItems = feedItems.length > 0 ? [...feedItems, ...feedItems] : [];

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
