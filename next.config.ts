import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure server-side code can use firebase-admin
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
