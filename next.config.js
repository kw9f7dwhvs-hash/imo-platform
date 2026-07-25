/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist", "sharp"],
  },
};
module.exports = nextConfig;
