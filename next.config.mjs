/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  // Set the project root for Turbopack to correctly resolve the workspace
  turbopack: {
    root: __dirname,
  },
  // Additional config options can be added here
};

export default nextConfig;
