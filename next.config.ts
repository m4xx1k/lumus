import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 — нативний модуль, не бандлимо його в серверний код.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
