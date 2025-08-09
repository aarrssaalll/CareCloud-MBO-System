/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable development optimizations
  experimental: {
    // Remove invalid serverHost option
  },
  // Enable SWC minification for better performance
  swcMinify: true,
  // Optimize images
  images: {
    domains: ['localhost'],
  },
  // Enable compression
  compress: true,
  // Optimize CSS
  optimizeFonts: true,
  // Development server config
  ...(process.env.NODE_ENV === 'development' && {
    // Use webpack 5 cache
    webpack: (config, { dev }) => {
      if (dev) {
        config.cache = {
          type: 'filesystem',
        };
      }
      return config;
    }
  })
};

export default nextConfig;
