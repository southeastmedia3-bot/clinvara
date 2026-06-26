import Link from "next/link";
import { sortedBlogs } from "@/lib/data/blogs";
import { SafeImage } from "@/components/shared/SafeImage";

export function BlogPreview() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 lg:px-8">
      <h2 className="mb-8 font-display text-[32px] font-semibold">
        From The Clinvara Journal
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
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
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
                {post.tag}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:underline">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--brand-text-muted)]">
                {post.excerpt}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--brand-mid-gray)]">
                <span>{post.date}</span>
                <span className="font-semibold text-black">Read More →</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
