# Ubiquitous Language

**最終更新**: 2026-02-05

コーヒー焙煎業務ドメインにおける共通用語定義。コード・UI・コミュニケーションで統一。

---

## 業務用語

### 焙煎関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **焙煎** | Roast | 生豆を加熱して焙煎豆にする工程 | `RoastTimer`, `RoastRecord` |
| **焙煎記録** | RoastRecord | 焙煎時の温度・時間・豆の種類等を記録したデータ | `roastRecords` コレクション |
| **焙煎タイマー** | RoastTimer | 焙煎時間を計測する機能 | `app/roast-timer/` |
| **生豆** | GreenBean | 焙煎前のコーヒー豆 | `greenBeanWeight` |
| **焙煎度** | RoastLevel | 浅煎り、中煎り、深煎りの度合い | `'light' | 'medium' | 'dark'` |
| **ハゼ** | Crack | 焙煎中に豆が膨張して割れる音 | `firstCrack`, `secondCrack` |
| **1ハゼ** | FirstCrack | 最初のハゼ（約200℃） | `firstCrackTime` |
| **2ハゼ** | SecondCrack | 2回目のハゼ（約220℃） | `secondCrackTime` |
| **投入** | Drop | 生豆を焙煎機に投入すること | `dropTime` |

### ドリップ関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **ドリップガイド** | DripGuide | ドリップ抽出の手順を案内する機能 | `app/drip-guide/` |
| **レシピ** | Recipe | 抽出レシピ（豆量、湯量、注湯回数、時間） | `DripRecipe` |
| **4:6メソッド** | 46Method | 粕谷哲氏考案の注湯比率による抽出メソッド | `calculate46Method` |
| **注湯** | Pour | お湯を注ぐ行為 | `pourSteps` |
| **蒸らし** | Bloom | 最初の少量注湯で豆を膨らませる工程 | `bloomTime` |
| **人前** | Servings | 抽出する杯数（1〜8杯） | `servings` |
| **豆量** | BeanAmount | 使用するコーヒー豆のグラム数 | `beanAmount` |
| **湯量** | WaterAmount | 使用するお湯のグラム数 | `waterAmount` |
| **抽出時間** | BrewTime | ドリップにかかる総時間 | `totalBrewTime` |

### テイスティング関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **テイスティングセッション** | TastingSession | コーヒーの味わいを評価する記録 | `tastingSessions` コレクション |
| **フレーバーホイール** | FlavorWheel | 味わいを構造化した評価軸 | `FlavorWheelScore` |
| **香り** | Aroma | コーヒーの香り評価 | `aroma` |
| **酸味** | Acidity | コーヒーの酸味評価 | `acidity` |
| **甘み** | Sweetness | コーヒーの甘み評価 | `sweetness` |
| **ボディ** | Body | コーヒーの口当たり、厚み | `body` |
| **余韻** | Aftertaste | コーヒーの後味 | `aftertaste` |

### 作業管理関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **担当表** | Assignment | 日々の作業担当割り当て表 | `assignments` コレクション |
| **スケジュール** | Schedule | OCRで読み取った業務予定 | `schedules` コレクション |
| **ハンドピック** | Handpick | 欠点豆を手作業で取り除く工程 | `handpickTask` |
| **出欠** | Attendance | 担当者の出勤・欠勤状態 | `isPresent` |
| **担当履歴** | AssignmentHistory | 過去の作業担当記録 | `assignmentHistory` |

### ゲーミフィケーション

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **コーヒークイズ** | CoffeeQuiz | 知識学習用クイズ | `app/coffee-trivia/` |
| **FSRS** | FSRS | Free Spaced Repetition Scheduler（間隔反復学習アルゴリズム） | `lib/coffee-quiz/fsrs.ts` |
| **XP** | ExperiencePoint | 経験値 | `currentXP`, `totalXP` |
| **ストリーク** | Streak | 連続日数 | `currentStreak` |
| **カテゴリ** | Category | クイズカテゴリ（basics, roasting, extraction, origin） | `QuizCategory` |
| **難易度** | Difficulty | クイズ難易度（easy, medium, hard） | `QuizDifficulty` |
| **レベル** | Level | ユーザーのレベル（経験値から算出） | `currentLevel` |

---

## 技術用語

### UI用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **クリスマスモード** | ChristmasMode | 季節テーマ（雪の結晶、配色変更） | `isChristmasMode` prop |
| **共通UIコンポーネント** | SharedUIComponent | `@/components/ui` の再利用可能コンポーネント | `Button`, `Card`, `Modal` |
| **UIカタログ** | UICatalog | `/ui-test` ページで閲覧可能な全コンポーネント一覧 | `registry.tsx` |
| **モーダル** | Modal | ポップアップダイアログ | `Modal`, `Dialog` |
| **トースト** | Toast | 一時的な通知表示 | `toast()` |

### データモデル用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **ユーザー** | User | Firebase Authで認証されたユーザー | `User` type |
| **セッション** | Session | 作業や評価の1単位 | `TastingSession`, `QuizSession` |
| **履歴** | History | 過去の作業記録 | `assignmentHistory`, `quizHistory` |
| **プロファイル** | Profile | ユーザープロフィール | `UserProfile` |
| **コレクション** | Collection | Firestoreのコレクション | `users`, `assignments`, `tastingSessions` |
| **ドキュメント** | Document | Firestoreのドキュメント | `doc(db, 'users', userId)` |

### 状態管理用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **Zustand** | Zustand | 軽量な状態管理ライブラリ | `useRoastTimerStore` |
| **ハイドレーション** | Hydration | サーバーサイドレンダリングからクライアント状態への移行 | `isHydrated` |
| **ローディング** | Loading | データ読み込み中状態 | `isLoading` |
| **エラー** | Error | エラー状態 | `error` |

---

## ドメインロジック用語

### FSRS関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **復習間隔** | ReviewInterval | 次回復習までの日数 | `nextReviewDate` |
| **難易度** | Difficulty | FSRSの難易度パラメータ | `difficulty` |
| **安定性** | Stability | FSRSの安定性パラメータ | `stability` |
| **想起確率** | Retrievability | 記憶の想起確率 | `retrievability` |

### タイマー関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **経過時間** | ElapsedTime | タイマー開始からの経過時間（秒） | `elapsedTime` |
| **開始時刻** | StartTime | タイマー開始時刻（タイムスタンプ） | `startTime` |
| **一時停止** | Pause | タイマーの一時停止 | `isPaused` |
| **リセット** | Reset | タイマーを初期状態に戻す | `reset()` |

---

## 命名規則

### TypeScript型定義

| 種類 | 規則 | 例 |
|-----|------|-----|
| インターフェース | PascalCase | `QuizQuestion`, `DripRecipe` |
| 型エイリアス | PascalCase | `QuizCategory`, `QuizDifficulty` |
| ユニオン型 | PascalCase + リテラル型 | `'light' \| 'medium' \| 'dark'` |

### 関数・変数

| 種類 | 規則 | 例 |
|-----|------|-----|
| 関数 | camelCase（動詞始まり） | `calculateXP`, `updateStreak` |
| 変数 | camelCase | `isLoading`, `userData` |
| ブール値 | `is`, `has`, `should` 始まり | `isChristmasMode`, `hasError` |
| 定数 | UPPER_SNAKE_CASE | `XP_CONFIG`, `CATEGORY_LABELS` |

### コンポーネント

| 種類 | 規則 | 例 |
|-----|------|-----|
| Reactコンポーネント | PascalCase | `QuizCard`, `DripTimer` |
| カスタムフック | `use` 始まり | `useRoastTimer`, `useChristmasMode` |
| イベントハンドラ | `handle` 始まり | `handleSubmit`, `handleClick` |

---

## 略語・頭字語

| 略語 | 正式名称 | 用途 |
|-----|---------|------|
| **PWA** | Progressive Web App | アプリの種類 |
| **OCR** | Optical Character Recognition | 画像からテキスト抽出 |
| **AI** | Artificial Intelligence | OpenAI API使用 |
| **FSRS** | Free Spaced Repetition Scheduler | 間隔反復学習 |
| **XP** | Experience Point | 経験値 |
| **UI** | User Interface | ユーザーインターフェース |
| **UX** | User Experience | ユーザー体験 |
| **API** | Application Programming Interface | 外部サービス連携 |
| **ADR** | Architecture Decision Record | アーキテクチャ意思決定記録 |

---

## 用語の使い分け

### 「セッション」の使い分け

| 文脈 | 用語 | 例 |
|-----|------|-----|
| テイスティング | TastingSession | テイスティングセッション作成 |
| クイズ | QuizSession | クイズセッション（1回のクイズ実施） |
| ユーザーログイン | UserSession | ユーザーセッション（Firebase Auth） |

### 「タイマー」の使い分け

| 文脈 | 用語 | 例 |
|-----|------|-----|
| 焙煎 | RoastTimer | 焙煎タイマー |
| ドリップ | DripTimer | ドリップタイマー |
| 汎用 | Timer | 汎用タイマー |

---

## 禁止事項

### 避けるべき用語

| ❌ 避ける | ✅ 使う | 理由 |
|----------|--------|------|
| Coffee | Bean（豆に関する場合） | より具体的 |
| Data | Record, Session（文脈による） | より明確 |
| Info | Profile, Detail（文脈による） | より明確 |
| Manager | Store, Service（文脈による） | より具体的 |

### 日本語と英語の混在

- **コード**: 英語のみ（変数名、関数名、型名）
- **UI**: 日本語（ユーザー向け表示）
- **コメント**: 日本語可（ただし、英語推奨）
- **コミットメッセージ**: 日本語（コンベンショナルコミット形式）

---

## 用語の追加・変更

新しいドメイン用語が登場した場合、以下のプロセスで追加：

1. **提案**: Issue作成またはPRのコメント
2. **議論**: チーム（または開発者）で用語の適切性を議論
3. **承認**: 合意が得られたらこのドキュメントに追加
4. **コード反映**: リファクタリングで既存コードに適用（必要な場合）

---

## 参照

- **コーディング規約**: `docs/steering/GUIDELINES.md`
- **機能一覧**: `docs/steering/FEATURES.md`
- **技術仕様**: `docs/steering/TECH_SPEC.md`
