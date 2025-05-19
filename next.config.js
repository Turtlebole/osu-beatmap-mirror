/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.ppy.sh",
      },
      {
        protocol: "https",
        hostname: "assets.ppy.sh",
      },
      {
        protocol: "https",
        hostname: "s.ppy.sh",
      },
      {
        protocol: "https", 
        hostname: "osu.ppy.sh",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      }
    ],
  },
  // Keep any existing config options
}

module.exports = nextConfig 