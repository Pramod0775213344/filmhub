/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "www.themoviedb.org",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    qualities: [75, 90],
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  reactCompiler: true,
  // Build trigger: v1.0.1
};

export default nextConfig;
