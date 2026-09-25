/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["*"],
  transpilePackages: ["mermaid"],
};

export default nextConfig;
