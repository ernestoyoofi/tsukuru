import loadConfig from "./src/lib/load-config.js";

const { base } = await loadConfig();

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(base.dist ? { basePath: base.dist } : {}),
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.42.*", "localhost:3000"],
  transpilePackages: ["mermaid"],
};

export default nextConfig;
