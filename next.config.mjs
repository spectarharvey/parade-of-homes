/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Uploaded listing photos. These are sized by Cloudinary itself through
      // the loader in HomeCard; the pattern covers any other <Image> use.
      { protocol: "https", hostname: "res.cloudinary.com" },
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
