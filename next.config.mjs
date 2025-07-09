/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  webpack: (config, { dev }) => {
    // Disable code minimization in production. This works around a Terser parsing
    // issue that surfaces when third-party packages ship web-worker bundles
    // containing top-level `export {}` statements (e.g. Coinbase Wallet SDK's
    // HeartbeatWorker). Skipping minification prevents the build from crashing
    // while keeping the rest of the optimisation pipeline intact.
    if (!dev) {
      config.optimization.minimize = false;
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
