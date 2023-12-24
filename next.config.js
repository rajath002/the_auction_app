/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: '1000logos.net',
              port: '',
              pathname: '/wp-content/uploads/**',
            },
          ],
    }
}

module.exports = nextConfig
