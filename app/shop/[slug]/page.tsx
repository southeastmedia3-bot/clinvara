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

  const description =
    product.seoDescription ||
    `${product.description} Shop ${product.name} by CLINVARA for ${product.concerns.join(
      ", "
    )}.`;

  return {
    title,
    description,

    keywords: [
      product.name,
      ...product.concerns,
      "clinical skincare",
      "dermatologist tested skincare",
      "niacinamide serum",
      "ceramide moisturizer",
      "pigmentation skincare",
      "skin barrier repair",
      "CLINVARA",
    ],

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How often should I use ${product.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Follow the recommended usage instructions on the product page. Most skincare products are designed for consistent daily use as part of a balanced skincare routine.",
        },
      },
      {
        "@type": "Question",
        name: `Is ${product.name} suitable for sensitive skin?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Individual skin responses vary. Patch testing before first use is recommended, especially for sensitive skin.",
        },
      },
      {
        "@type": "Question",
        name: `Can I use ${product.name} with other skincare products?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. This product can generally be incorporated into a broader skincare routine. Follow product directions and introduce new products gradually.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to see results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Results vary depending on skin type, concerns, and consistency of use. Maintaining a regular skincare routine is important.",
        },
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
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