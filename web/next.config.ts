import type { NextConfig } from "next";

// Cloudflare Workers build (CF_BUILD=1): Cache Components hangs on the Workers timer, and the app uses none of its APIs.
const onWorkers = process.env.CF_BUILD === "1";

const nextConfig: NextConfig = {
  cacheComponents: !onWorkers,
  partialPrefetching: !onWorkers,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
