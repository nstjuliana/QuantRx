/**
 * Next.js Configuration
 *
 * This file configures Next.js for the QuantRx application.
 * It imports lib/env.js to validate environment variables at build/startup time.
 */

// Validate environment variables before config runs
import './lib/env.js';

const nextConfig = {
  // Add any Next.js specific configuration here
  // For now, basic configuration is sufficient

  // Image domains can be configured later if needed
  // images: {
  //   domains: ['example.com'],
  // },
};

export default nextConfig;
