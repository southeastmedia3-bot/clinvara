import { Facebook, Instagram, Youtube, type LucideIcon } from "lucide-react";

export type SocialPlatform = "Instagram" | "Facebook" | "YouTube";

export type SocialLink = {
  platform: SocialPlatform;
  href: string;
  handle: string;
  icon: LucideIcon;
};

export const socialLinks: SocialLink[] = [
  {
    platform: "Instagram",
    href: "https://www.instagram.com/clinvaraglobal/",
    handle: "@clinvaraglobal",
    icon: Instagram,
  },
  {
    platform: "Facebook",
    href: "https://www.facebook.com/people/Clinvara-global/61590268716995/",
    handle: "Clinvara global",
    icon: Facebook,
  },
  {
    platform: "YouTube",
    href: "https://www.youtube.com/channel/UCi5HxfxaBwjAGqXEbWT_QYQ",
    handle: "CLINVARA",
    icon: Youtube,
  },
];

export const socialFeed = [
  {
    platform: "Instagram" as const,
    title: "Follow daily skin rituals",
    body: "Routine edits, product textures, and ingredient notes from CLINVARA.",
    href: socialLinks[0].href,
    cta: "Open Instagram",
  },
  {
    platform: "Facebook" as const,
    title: "Community updates",
    body: "Launch notes, offers, and customer care updates in one place.",
    href: socialLinks[1].href,
    cta: "Open Facebook",
  },
  {
    platform: "YouTube" as const,
    title: "Watch skincare explainers",
    body: "Longer-form education for routines, actives, and skin barrier care.",
    href: socialLinks[2].href,
    cta: "Open YouTube",
  },
  {
    platform: "Instagram" as const,
    title: "Follow CLINVARA",
    body: "Follow CLINVARA for routine tips and launch updates.",
    href: socialLinks[0].href,
    cta: "Follow now",
  },
];
