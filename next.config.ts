import { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@ansospace/ui"],
  reactCompiler: true,
  cacheComponents: true,
};

export default nextConfig;
