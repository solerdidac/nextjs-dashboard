import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Si necesitas otras opciones de Next.js, añádelas aquí
  webpack(config, { isServer }) {
    // Asegúrate de que existan las propiedades resolve y alias
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Redirige cualquier require('bcrypt') a bcryptjs
      bcrypt: 'bcryptjs',
    };

    return config;
  },
};

export default nextConfig;
