/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
       {
        protocol: "https",
        hostname: "images.unsplash.com", // covers actual image CDN redirects
      },
    ],
  },
};

export default nextConfig;
