/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.42.*", "localhost:3000"],
  transpilePackages: ["mermaid"],
};

export default nextConfig;
