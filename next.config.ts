import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番ビルド時のみ静的エクスポートを有効化
  // 開発モードでは通常のNext.jsサーバーとして動作（動的ルートが正常に動作する）
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
