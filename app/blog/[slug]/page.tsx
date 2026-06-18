import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogs, getBlogBySlug } from "@/lib/data/blogs";
import { getProductsForBlog } from "@/lib/data/internalLinks";
import { SafeImage } from "@/components/shared/SafeImage";
import { BackButton } from "@/components/ui/BackButton";

type Props = { params: { slug: string } };

function cleanMarkdownText(value: string) {
  return value.replace(/\*\*/g, "").replace(/^\*|\*$/g, "");
}

function renderArticleSection(section: string, sectionIndex: number) {
  const chunks = section.split(/\n{2,}/).filter(Boolean);

  return chunks.map((chunk, chunkIndex) => {
    const key = `${sectionIndex}-${chunkIndex}`;
    const lines = chunk.split("\n").filter(Boolean);

    if (lines.every((line) => line.trim().startsWith("|"))) {
      return (
        <div key={key} className="overflow-x-auto rounded-2xl border border-[var(--brand-border)] bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <tbody>
              {lines
                .filter((line) => !/^\|\s*-/.test(line))
                .map((line, rowIndex) => (
                  <tr key={`${key}-row-${rowIndex}`} className="border-b border-[var(--brand-border)] last:border-0">
                    {line
                      .split("|")
                      .map((cell) => cell.trim())
                      .filter(Boolean)
                      .map((cell, cellIndex) => (
                        <td key={`${key}-cell-${cellIndex}`} className="px-4 py-3 align-top">
                          {cleanMarkdownText(cell)}
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (lines.every((line) => line.trim().startsWith("- "))) {
      return (
        <ul key={key} className="space-y-2 pl-5 text-[16px] leading-8 text-[var(--brand-text-muted)]">
          {lines.map((line, index) => (
            <li key={`${key}-item-${index}`} className="list-disc pl-2">
              {cleanMarkdownText(line.replace(/^- /, ""))}
            </li>
          ))}
        </ul>
      );
    }

    return lines.map((line, lineIndex) => {
      const lineKey = `${key}-${lineIndex}`;
      if (line.startsWith("### ")) {
        return (
          <h3 key={lineKey} className="pt-4 font-display text-2xl font-semibold leading-tight text-black">
            {cleanMarkdownText(line.replace(/^### /, ""))}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={lineKey} className="pt-8 font-display text-3xl font-semibold leading-tight text-black">
            {cleanMarkdownText(line.replace(/^## /, ""))}
          </h2>
        );
      }
      return (
        <p key={lineKey} className="text-[16px] leading-8 text-[var(--brand-text-muted)]">
          {cleanMarkdownText(line)}
        </p>
      );
    });
  });
}

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
    twitter: {
      title: `${post.title} | CLINVARA`,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogBySlug(params.slug);
  if (!post) notFound();
  const relatedProducts = getProductsForBlog(post.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "CLINVARA",
    },
    publisher: {
      "@type": "Organization",
      name: "CLINVARA",
      logo: {
        "@type": "ImageObject",
        url: "https://clinvara.global/images/brand/clinvara-logo.png",
      },
    },
    mainEntityOfPage: `https://clinvara.global/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-[820px] px-4 py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BackButton fallbackHref="/blog" label="Back to Journal" />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
        {post.tag}
      </p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl">
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
      <div className="mt-10 space-y-6">
        <p className="border-l-2 border-black pl-5 text-lg leading-8 text-black">
          {post.excerpt}
        </p>
        {(post.content ?? []).map((section, index) => renderArticleSection(section, index))}
      </div>
      <section className="mt-10 border-t border-[var(--brand-border)] pt-6">
        <h2 className="font-display text-2xl font-semibold">
          Shop Related Products
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-muted)]">
          Formulas connected to this article&apos;s core skin concern and routine guidance.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {relatedProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className="rounded-xl border border-[var(--brand-border)] p-4 text-sm hover:border-black"
            >
              <span className="block font-semibold">{product.name}</span>
              <span className="mt-1 block text-xs text-[var(--brand-text-muted)]">
                {product.concern}
              </span>
            </Link>
          ))}
        </div>
        <Link href="/blog" className="mt-6 inline-flex text-sm font-semibold underline">
          Back to all journal articles
        </Link>
      </section>
    </article>
  );
}
