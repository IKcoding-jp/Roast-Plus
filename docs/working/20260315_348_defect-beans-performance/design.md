# 設計書

## 実装方針

### 問題の本質
Firebase Storageから配信される画像が未圧縮で大きく、`next/image`の`unoptimized`指定（静的エクスポートのため必須）により最適化もされないため、個々の画像読み込みが遅く表示タイミングにばらつきが生じている。

### 変更対象ファイル
- `components/DefectBeanCard.tsx` - フェードイン表示 + 優先度制御
- `app/defect-beans/page.tsx` - カードへのindex伝達
- `lib/imageCompression.ts`（新規） - 画像圧縮ユーティリティ
- `hooks/useDefectBeans.ts` - アップロード前の圧縮処理追加

## フェードイン表示設計

### 画像読み込み状態管理
```typescript
const [imageLoaded, setImageLoaded] = useState(false);
```

### CSS遷移
- 読み込み前: `opacity-0`
- 読み込み後: `opacity-100 transition-opacity duration-300`
- プレースホルダー: 画像コンテナに`bg-surface-alt`を設定

## 優先度制御設計

### props追加
```typescript
interface DefectBeanCardProps {
  // 既存props...
  index?: number; // グリッド内の位置
}
```

### 判定ロジック
- `index < 5` → `priority={true}`（LCP最適化）
- それ以外 → デフォルト（lazy loading）

## 画像圧縮設計

### 圧縮仕様
- 最大サイズ: 800 x 800px（長辺基準）
- フォーマット: JPEG（`image/jpeg`）
- 品質: 0.8（80%）
- アスペクト比: 維持

### 実装方法
Canvas APIを使用:
1. FileをImageに読み込み
2. Canvasにリサイズ描画
3. `canvas.toBlob()`でJPEG変換
4. BlobからFileオブジェクト生成

### 適用箇所
`useDefectBeans.ts`の`addDefectBean`と`updateDefectBean`の`imageFile`パラメータに対して、アップロード前に圧縮処理を適用。

## 影響範囲
- 欠点豆カタログの画像表示体験が改善
- 今後アップロードされる画像のファイルサイズが削減
- 既存画像には影響なし（フェードインで体験改善のみ）

## ADR

### Decision-001: フェードインアニメーション採用
- **理由**: 画像の表示タイミングのばらつきを「パッと出現」から「フワッと出現」に変えることで、体感的な統一感を実現
- **影響**: わずかなCSS追加のみで軽量

### Decision-002: クライアントサイド圧縮
- **理由**: Cloud Functionsでの画像処理はコスト・遅延が発生。クライアントサイドのCanvas APIは追加依存なしで実現可能
- **影響**: アップロード時に数百msの処理時間が追加されるが、ダウンロード速度の改善で十分ペイする
