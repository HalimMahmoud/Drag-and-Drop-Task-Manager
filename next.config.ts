import type { NextConfig } from 'next';

// GitHub Pages serves static files only, so the app is exported as a prerendered
// site. Deployment settings, in order of importance:
//
//   output: 'export'  no Node server at runtime; the whole app runs in the browser
//                     and talks to Supabase directly over the public API.
//   trailingSlash     Pages resolves /slug to /slug/index.html, not /slug.html.
//   images            the image optimizer is a server route, so it is unavailable.
//   basePath          set NEXT_PUBLIC_BASE_PATH=/<repo> when publishing to a project
//                     site (user.github.io/<repo>) so assets resolve. Leave it empty
//                     for a user site at user.github.io.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;