/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "1000logos.net",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "lh3.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol:"https",
        hostname: "**",
        pathname: "**"
      }
    ],
  },
};

module.exports = nextConfig;
