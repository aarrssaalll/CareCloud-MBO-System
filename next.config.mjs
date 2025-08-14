/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      optimizePackageImports: ['@heroicons/react'],
    },
  }),
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    experimental: {
      optimizePackageImports: ['@heroicons/react'],
    },
  }),
};

export default nextConfig;
