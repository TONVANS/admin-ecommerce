/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ เพิ่มนี้
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ ปิด TypeScript errors ชั่วคราว
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "pub-b7fd9c30cdbf439183b75041f5f71b92.r2.dev",
        port: "",
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        // ຕ້ອງໝັ້ນໃຈວ່າ ENV ນີ້ມີຄ່າໃນ Runtime (Docker)
        hostname: process.env.NEXT_PUBLIC_API_URL 
          ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname 
          : 'jprl-api.edl.com.la', 
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
