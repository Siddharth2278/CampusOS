import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["10.12.132.201"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
