/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/extract',
        destination: 'https://passionate-eagerness-production-3c4a.up.railway.app/extract',
      },
    ]
  },
};

export default nextConfig; 