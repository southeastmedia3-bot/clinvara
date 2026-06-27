/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/shop/niacinamide-10-face-serum",
        destination: "/shop/acne-reset-serum",
        permanent: true,
      },
      {
        source: "/shop/niacinamide-10-zinc-serum",
        destination: "/shop/acne-reset-serum",
        permanent: true,
      },
      {
        source: "/shop/natural-moisturizing-factors-ha-cleanser",
        destination: "/shop/clear-cleanse-face-wash",
        permanent: true,
      },
      {
        source: "/shop/nmf-ha-cleanser",
        destination: "/shop/clear-cleanse-face-wash",
        permanent: true,
      },
      {
        source: "/shop/ceramide-moisture",
        destination: "/shop/barrier-restore-gel",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
