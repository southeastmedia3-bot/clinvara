import type { Metadata } from "next";
import Link from "next/link";
import { blogs, sortedBlogs } from "@/lib/data/blogs";
import { SafeImage } from "@/components/shared/SafeImage";

export const metadata: Metadata = {
  title: "The Clinvara Journal",
  description: "Skincare guides, ingredient science, and barrier health from CLINVARA.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "The Clinvara Journal | CLINVARA",
    description: "Skincare guides, ingredient science, and barrier health from CLINVARA.",
    url: "/blog",
    images: [blogs[0]?.image ?? "/images/brand/clinvara-logo.png"],
  },
  twitter: {
    title: "The Clinvara Journal | CLINVARA",
    description: "Skincare guides, ingredient science, and barrier health from CLINVARA.",
    images: [blogs[0]?.image ?? "/images/brand/clinvara-logo.png"],
  },
};

export default function BlogListingPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">The Clinvara Journal</h1>
      <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
        Evidence-led education for smarter skincare choices.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sortedBlogs.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`}>
              <div className="relative mb-4 aspect-video overflow-hidden bg-[var(--brand-light-gray)]">
                <SafeImage
                  src={post.image}
                  alt={post.title}
                  label={post.title}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-[1.03]"
                />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
                {post.tag}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold group-hover:underline">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--brand-text-muted)]">
                {post.excerpt}
              </p>
              <p className="mt-3 text-xs text-[var(--brand-mid-gray)]">{post.date}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
