/** @type {import('next').NextConfig} */
const nextConfig = {
  // `output: 'export'` removed so the agentic /api/ask route can run on
  // Vercel serverless. Non-API pages still prerender statically.
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  // Force eager evaluation of data loaders during build so Zod schema drift fails the build.
  experimental: {
    typedRoutes: false,
  },
  // @huggingface/transformers is loaded from CDN at runtime via a
  // `webpackIgnore`-marked dynamic import (see app/tokenizer/_components/
  // tokenizer-engine.ts), so no special webpack config is needed.
};

export default nextConfig;
