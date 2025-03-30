/** @type {import('next').NextConfig} */

// Keep reactStrictMode, remove complex webpack config and rely on Next.js defaults + SWC
const nextConfig = {
  reactStrictMode: true,
  // No custom webpack config needed for this approach

  // Keep minimal experimental features if they don't cause issues
  experimental: {
    // workerThreads: true, // Can potentially be kept if stable
  },
};

console.log(
  '[next.config.js] Using simplified configuration. Relying on SWC and Cluster parallelism.'
);

module.exports = nextConfig;
