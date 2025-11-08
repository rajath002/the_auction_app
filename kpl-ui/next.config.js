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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark Sequelize and database drivers as external for server-side
      config.externals.push({
        'pg': 'commonjs pg',
        'pg-hstore': 'commonjs pg-hstore',
        'sequelize': 'commonjs sequelize',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
