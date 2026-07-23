/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // The registration/entry hub lives at /event now; keep the old path working.
      { source: "/event-calendar", destination: "/event", permanent: true },
    ];
  },
};

export default nextConfig;
