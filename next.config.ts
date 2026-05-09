import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ynugdfsltuxwqkadsiot.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
