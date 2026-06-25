import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home dir makes Turbopack guess the wrong
  // workspace root; pin it to this project. (Machine gotcha, see CLAUDE.md.)
  turbopack: { root: __dirname },
};

export default nextConfig;
