/** @type {import('next').NextConfig} */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// 1. Resolve the correct path to the root .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

// 2. Load environment variables from root .env
const { parsed: env } = config({ path: envPath });

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    RECAPTCHA_SECRET_KEY: env.RECAPTCHA_SECRET_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

}

export default nextConfig
