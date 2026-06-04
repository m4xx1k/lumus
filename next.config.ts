import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // libSQL має нативні частини — не бандлимо його в серверний код.
  serverExternalPackages: ["@libsql/client"],
  experimental: {
    serverActions: {
      // Дефолт — 1 МБ. Піднімаємо, бо контент тем містить вбудовані картинки
      // (base64). Картинки також стискаються в браузері перед вставкою.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
