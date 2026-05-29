import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allProducts } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import {
  getApprovedReviews,
  getRelatedProducts,
  getStorefrontProductBySlug,
} from "@/lib/firebase/products";
import { isOutOfStock } from "@/lib/productAvailability";

type Props = { params: { slug: string } };

const siteUrl = "https://clinvara.global";
function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${path}`;
}

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getStorefrontProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = product.seoTitle || `${product.name} | Clinical Skincare`;
  const description = product.seoDescription || `${product.description} Shop ${product.name} by CLINVARA for ${product.concerns.join(
    ", ",
  )}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/shop/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | CLINVARA`,
      description,
      url: `/shop/${product.slug}`,
      type: "website",
      images: [
        {
          url: product.image,
          width: 1200,
          height: 1200,
          alt: product.galleryAlt?.[0] || product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | CLINVARA`,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getStorefrontProductBySlug(params.slug);

  if (!product) notFound();
  const relatedProducts = await getRelatedProducts(product);
  const approvedReviews = await getApprovedReviews(product.slug);

  const productUrl = `${siteUrl}/shop/${product.slug}`;
  const imageUrl = absoluteUrl(product.image);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery?.length
      ? product.gallery.map((image) => absoluteUrl(image))
      : [imageUrl],
    description: product.description,
    sku: `CLINVARA-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "CLINVARA",
    },
    category: product.category,
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: product.price,
      priceCurrency: "INR",
      availability: isOutOfStock(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "CLINVARA",
      },
    },
    aggregateRating:
      product.rating && product.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${siteUrl}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        reviews={approvedReviews}
      />
    </>
  );
}
