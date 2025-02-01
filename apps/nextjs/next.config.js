import { fileURLToPath } from "url";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      // Ensure HMR is enabled
      config.optimization.moduleIds = 'named';
    }
    return config;
  },

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@ars/api",
    "@ars/auth",
    "@ars/db",
    "@ars/ui",
    "@ars/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;
