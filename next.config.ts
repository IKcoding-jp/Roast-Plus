import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

// package.jsonからバージョンを読み込む
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8")
);

const nextConfig: NextConfig = {
  // 本番ビルド時のみ静的エクスポートを有効化
  // 開発モードでは通常のNext.jsサーバーとして動作（動的ルートが正常に動作する）
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
// Force restart
