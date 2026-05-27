import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogs, getBlogBySlug } from "@/lib/data/blogs";
import { SafeImage } from "@/components/shared/SafeImage";
import { BackButton } from "@/components/ui/BackButton";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogBySlug(params.slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      images: [post.image],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <BackButton fallbackHref="/blog" label="Back to Journal" />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
        {post.tag}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold leading-tight">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--brand-mid-gray)]">{post.date}</p>
      <div className="relative mt-8 aspect-video overflow-hidden bg-[var(--brand-light-gray)]">
        <SafeImage
          src={post.image}
          alt={post.title}
          label={post.title}
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="prose prose-sm mt-8 max-w-none space-y-4 text-[15px] leading-relaxed text-[var(--brand-text-muted)]">
        <p className="text-base text-black">{post.excerpt}</p>
        {(post.content ?? []).map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>
      <div className="mt-10 border-t border-[var(--brand-border)] pt-6">
        <Link href="/blog" className="text-sm font-semibold underline">
          Back to all journal articles
        </Link>
      </div>
    </article>
  );
}
