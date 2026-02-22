# Ubiquitous Language

**最終更新**: 2026-02-21

コーヒー焙煎業務ドメインにおける共通用語定義。コード・UI・コミュニケーションで統一して使用する。

---

## 業務用語

### 焙煎関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **焙煎** | Roast | 生豆を加熱して焙煎豆にする工程 | `RoastTimer`, `RoastRecord` |
| **焙煎記録** | RoastRecord | 焙煎時の温度・時間・豆の種類等を記録したデータ | `roastRecords` コレクション |
| **焙煎タイマー** | RoastTimer | 焙煎時間を計測する機能 | `app/roast-timer/` |
| **生豆** | GreenBean | 焙煎前のコーヒー豆 | `greenBeanWeight` |
| **焙煎度** | RoastLevel | 浅煎り、中煎り、深煎りの度合い | `'light' \| 'medium' \| 'dark'` |
| **ハゼ** | Crack | 焙煎中に豆が膨張して割れる音 | `firstCrack`, `secondCrack` |
| **1ハゼ** | FirstCrack | 最初のハゼ（約200℃） | `firstCrackTime` |
| **2ハゼ** | SecondCrack | 2回目のハゼ（約220℃） | `secondCrackTime` |
| **投入** | Drop | 生豆を焙煎機に投入すること | `dropTime` |
| **焙煎スケジュール** | RoastSchedule | 焙煎作業の予定（豆名・焙煎度・数量等） | `RoastSchedule` 型 |

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
| **フレーバーホイール** | FlavorWheel | 味わいを構造化した評価軸（5軸） | `FlavorWheelScore` |
| **香り** | Aroma | コーヒーの香り評価（1〜5） | `aroma` |
| **酸味** | Acidity | コーヒーの酸味評価（1〜5） | `acidity` |
| **甘み** | Sweetness | コーヒーの甘み評価（1〜5） | `sweetness` |
| **ボディ** | Body | コーヒーの口当たり、厚み（1〜5） | `body` |
| **余韻** | Aftertaste | コーヒーの後味（1〜5） | `aftertaste` |
| **苦味** | Bitterness | コーヒーの苦味評価（1〜5） | `bitterness` |
| **AI分析** | AIAnalysis | OpenAI GPT-4oによるテイスティング評価の自動分析 | `aiAnalysis` |

### 作業管理関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **担当表** | Assignment | 日々の作業担当割り当て表 | `assignments` コレクション |
| **スケジュール** | Schedule | OCRで読み取った業務予定 | `schedules` コレクション |
| **ハンドピック** | Handpick | 欠点豆を手作業で取り除く工程 | `handpickTask` |
| **出欠** | Attendance | 担当者の出勤・欠勤状態 | `isPresent` |
| **担当履歴** | AssignmentHistory | 過去の作業担当記録 | `assignmentHistory` |
| **欠点豆** | DefectBean | 品質基準を満たさないコーヒー豆 | `defectBeans` コレクション |
| **時間ラベル** | TimeLabel | スケジュール画像から抽出された時間情報 | `TimeLabel` 型 |

### ゲーミフィケーション

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **コーヒークイズ** | CoffeeQuiz | 知識学習用クイズ | `app/coffee-trivia/` |
| **FSRS** | FSRS | Free Spaced Repetition Scheduler（間隔反復学習アルゴリズム） | `lib/coffee-quiz/fsrs.ts` |
| **XP** | ExperiencePoint | 経験値（クイズ正解で獲得） | `currentXP`, `totalXP` |
| **ストリーク** | Streak | 連続学習日数 | `currentStreak` |
| **カテゴリ** | Category | クイズカテゴリ（basics, roasting, extraction, origin） | `QuizCategory` |
| **難易度** | Difficulty | クイズ難易度（easy, medium, hard） | `QuizDifficulty` |
| **レベル** | Level | ユーザーのレベル（経験値から算出） | `currentLevel` |

---

## 技術用語

### UI用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **テーマプリセット** | ThemePreset | テーマの定義情報（ID、名前、配色、タイプ等） | `ThemePreset` interface in `lib/theme.ts` |
| **テーマID** | ThemeID | テーマの一意識別子（`default`, `dark-roast`, `light-roast`, `matcha`, `caramel`, `christmas`, `dark`） | `THEME_PRESETS[].id` |
| **セマンティックトークン** | SemanticToken | テーマ対応のCSS変数（`bg-page`, `text-ink`等） | `bg-surface`, `text-ink-sub`, `border-edge` |
| **クリスマステーマ** | ChristmasTheme | 7テーマの1つ（ID: `christmas`）。配色はCSS変数で自動適用。テーマ固有の装飾要素（snowfall等）のみ条件レンダリング | `useAppTheme().isChristmasTheme` |
| **共通UIコンポーネント** | SharedUIComponent | `@/components/ui` の再利用可能コンポーネント | `Button`, `Card`, `Modal` |
| **UIカタログ** | UICatalog | Developer Design Labで閲覧可能な全コンポーネント一覧 | `registry.tsx` |
| **モーダル** | Modal | ポップアップダイアログ（不透明背景: `bg-overlay`） | `Modal`, `Dialog` |
| **トースト** | Toast | 一時的な通知表示 | `toast()` |
| **バックリンク** | BackLink | ページ上部の戻るナビゲーション | `BackLink` コンポーネント |

### データモデル用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **ユーザー** | User | Firebase Authで認証されたユーザー | `User` type |
| **セッション** | Session | 作業や評価の1単位 | `TastingSession`, `QuizSession` |
| **履歴** | History | 過去の作業記録 | `assignmentHistory`, `quizHistory` |
| **プロファイル** | Profile | ユーザープロフィール | `UserProfile` |
| **コレクション** | Collection | Firestoreのトップレベルコレクション | `users`, `defectBeans`, `_meta` |
| **ドキュメント** | Document | Firestoreのドキュメント | `doc(db, 'users', userId)` |
| **サブコレクション** | Subcollection | ドキュメント配下のコレクション | `users/{userId}/assignments` |
| **ユーザードキュメント** | UserDocument | `users/{userId}` にフィールドとして格納されるユーザーデータ | 焙煎記録、クイズ進捗、レシピ等 |

### 状態管理用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **React useState** | React useState | Reactの組み込み状態管理。本プロジェクトの唯一の状態管理手法 | `useState<boolean>(false)` |
| **リアルタイム同期** | RealtimeSync | FirestoreのonSnapshotリスナーによるデータ自動同期 | `onSnapshot(docRef, callback)` |
| **ハイドレーション** | Hydration | サーバーサイドレンダリングからクライアント状態への移行 | `isHydrated` |
| **ローディング** | Loading | データ読み込み中状態 | `isLoading` |
| **エラー** | Error | エラー状態 | `error` |

### AI・Cloud Functions用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **Cloud Functions** | CloudFunctions | Firebase Cloud Functions。サーバーレスでAI処理を実行 | `functions/src/` |
| **ocrScheduleFromImage** | ocrScheduleFromImage | スケジュール画像をOCR処理するCloud Function | `httpsCallable(functions, 'ocrScheduleFromImage')` |
| **analyzeTastingSession** | analyzeTastingSession | テイスティングセッションをAI分析するCloud Function | `httpsCallable(functions, 'analyzeTastingSession')` |
| **httpsCallable** | httpsCallable | Firebase SDKのCloud Functions呼び出しメソッド | `httpsCallable<InputType, OutputType>(functions, 'functionName')` |
| **Firebase Secret Manager** | FirebaseSecretManager | Cloud FunctionsのAPIキー（OPENAI_API_KEY等）を安全に管理するサービス | `defineSecret('OPENAI_API_KEY')` |
| **GPT-4o** | GPT4o | OpenAIの大規模言語モデル。テイスティング分析・OCR処理に使用 | Cloud Functions内部で使用 |
| **GPT-4o Vision** | GPT4oVision | GPT-4oの画像入力機能。スケジュール画像・温度ラベルのOCRに使用 | Cloud Functions内部で使用 |

### テーマシステム用語

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **useAppTheme** | useAppTheme | 汎用テーマhook（テーマ取得・設定・判定） | `const { currentTheme, setTheme, isDarkTheme } = useAppTheme()` |
| **useChristmasMode** | useChristmasMode | クリスマステーマ切替hook（`useAppTheme().isChristmasTheme` でも判定可） | `const { isChristmasMode, toggleChristmasMode } = useChristmasMode()` |
| **data-theme属性** | dataThemeAttribute | `<html>` 要素に設定されるテーマ切替属性 | `data-theme="dark-roast"` |
| **next-themes** | nextThemes | テーマ切替ライブラリ（SSR対応、フラッシュ防止、タブ間同期） | `useTheme()` |
| **isDarkTheme** | isDarkTheme | テーマがダーク系かどうかを判定する関数 | `isDarkTheme('matcha')` → `true` |
| **ThemeProvider** | ThemeProvider | アプリ全体をラップするテーマプロバイダー | `components/ThemeProvider.tsx` |

---

## ドメインロジック用語

### FSRS関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **復習間隔** | ReviewInterval | 次回復習までの日数 | `nextReviewDate` |
| **難易度** | Difficulty | FSRSの難易度パラメータ（問題の難しさ） | `difficulty` |
| **安定性** | Stability | FSRSの安定性パラメータ（記憶の定着度） | `stability` |
| **想起確率** | Retrievability | 記憶の想起確率（時間経過で減衰） | `retrievability` |
| **クイズ進捗** | QuizProgress | 問題ごとのFSRSパラメータと復習スケジュール | `QuizProgress` interface |
| **ts-fsrs** | tsFSRS | FSRSアルゴリズムのTypeScript実装ライブラリ | `ts-fsrs` パッケージ |

### タイマー関連

| 用語 | 英語 | 定義 | コードでの使用例 |
|-----|------|------|----------------|
| **経過時間** | ElapsedTime | タイマー開始からの経過時間（秒） | `elapsedTime` |
| **開始時刻** | StartTime | タイマー開始時刻（タイムスタンプ） | `startTime` |
| **一時停止** | Pause | タイマーの一時停止 | `isPaused` |
| **リセット** | Reset | タイマーを初期状態に戻す | `reset()` |
| **フェーズ** | Phase | 焙煎工程の段階（投入、1ハゼ、2ハゼ、終了） | `'drop' \| 'firstCrack' \| 'secondCrack' \| 'finish'` |

---

## 命名規則

### TypeScript型定義

| 種類 | 規則 | 例 |
|-----|------|-----|
| インターフェース | PascalCase（`interface`優先） | `QuizQuestion`, `DripRecipe`, `ThemePreset` |
| 型エイリアス | PascalCase（ユニオン型のみ`type`） | `QuizCategory`, `QuizDifficulty`, `RoastLevel` |
| ユニオン型 | PascalCase + リテラル型 | `'light' \| 'medium' \| 'dark'` |
| ジェネリクス型パラメータ | 単一大文字または説明的PascalCase | `T`, `InputType`, `OutputType` |

### 関数・変数

| 種類 | 規則 | 例 |
|-----|------|-----|
| 関数 | camelCase（動詞始まり） | `calculateXP`, `updateStreak`, `extractScheduleFromImage` |
| 変数 | camelCase | `isLoading`, `userData`, `currentTheme` |
| ブール値 | `is`, `has`, `should` 始まり | `isLoading`, `hasError`, `isDarkTheme` |
| 定数 | UPPER_SNAKE_CASE | `XP_CONFIG`, `CATEGORY_LABELS`, `THEME_PRESETS` |
| Firebase Function名 | camelCase（動詞+名詞） | `ocrScheduleFromImage`, `analyzeTastingSession` |

### コンポーネント

| 種類 | 規則 | 例 |
|-----|------|-----|
| Reactコンポーネント | PascalCase | `QuizCard`, `DripTimer`, `ThemeSelector` |
| カスタムフック | `use` 始まり（camelCase） | `useRoastTimer`, `useAppTheme`, `useRecipeGuide` |
| イベントハンドラ | `handle` 始まり（camelCase） | `handleSubmit`, `handleClick`, `handleThemeChange` |
| コンテキスト | PascalCase + `Context` | `AuthContext`, `ThemeContext` |

---

## 略語・頭字語

| 略語 | 正式名称 | 用途 |
|-----|---------|------|
| **PWA** | Progressive Web App | アプリの種類 |
| **OCR** | Optical Character Recognition | 画像からテキスト抽出 |
| **AI** | Artificial Intelligence | OpenAI GPT-4o使用（Cloud Functions経由） |
| **FSRS** | Free Spaced Repetition Scheduler | 間隔反復学習アルゴリズム |
| **XP** | Experience Point | 経験値 |
| **UI** | User Interface | ユーザーインターフェース |
| **UX** | User Experience | ユーザー体験 |
| **API** | Application Programming Interface | 外部サービス連携 |
| **ADR** | Architecture Decision Record | アーキテクチャ意思決定記録（`TECH_SPEC.md` 参照） |
| **SDD** | Specification-Driven Development | 仕様駆動開発 |
| **TDD** | Test-Driven Development | テスト駆動開発 |
| **BaaS** | Backend as a Service | Firebase |
| **RSC** | React Server Components | Next.js App Routerのサーバーコンポーネント |
| **CCN** | Cyclomatic Complexity Number | 循環的複雑度 |
| **SW** | Service Worker | PWAのオフライン対応 |

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

### 「テーマ」の使い分け

| 文脈 | 用語 | 例 |
|-----|------|-----|
| テーマの定義情報（メタデータ） | ThemePreset | `THEME_PRESETS` 配列の各要素 |
| 現在適用中のテーマID | currentTheme | `useAppTheme().currentTheme` |
| テーマ切替操作 | setTheme | `useAppTheme().setTheme('matcha')` |
| テーマ固有装飾の判定 | isChristmasTheme | `useAppTheme().isChristmasTheme` |

### 「分析」の使い分け

| 文脈 | 用語 | 例 |
|-----|------|-----|
| テイスティングAI分析 | analyzeTastingSession | Cloud Function名 |
| スケジュールOCR処理 | ocrScheduleFromImage | Cloud Function名 |
| クライアント側ラッパー | analyzeTastingSession / extractScheduleFromImage | `lib/tastingAnalysis.ts`, `lib/scheduleOCR.ts` |

### 「モード」の使い分け

| 文脈 | 用語 | 例 |
|-----|------|-----|
| テーマ固有装飾 | ThemeDecoration | CSS `[data-theme]` セレクタ or `useAppTheme().isChristmasTheme`（snowfall等の条件レンダリング） |
| 開発者限定機能 | DeveloperMode | `isDeveloperMode`（Design Lab等へのアクセス制御） |
| ダーク系テーマ判定 | DarkTheme | `isDarkTheme`（ライト/ダークの判定のみ、モードではない） |

---

## 禁止事項

### 避けるべき用語

| 避ける | 使う | 理由 |
|--------|------|------|
| Coffee | Bean（豆に関する場合） | より具体的 |
| Data | Record, Session（文脈による） | より明確 |
| Info | Profile, Detail（文脈による） | より明確 |
| Manager | Service（文脈による） | より具体的 |
| Store（状態管理の意味で） | useState, hook | 本プロジェクトはZustand等の外部状態管理ライブラリを使用しない |
| Zustand, Redux, Recoil | React useState | 外部状態管理ライブラリは導入しない |
| API Route | Cloud Function | 静的エクスポートのためNext.js API Routesは使用不可 |
| `/api/xxx` | `httpsCallable` | Cloud Functions呼び出しはhttpsCallableで行う |
| Gemini | GPT-4o | AIモデルはOpenAI GPT-4oを使用（Google Geminiではない） |
| テーマprop渡し | CSS変数（テーマ自動対応） | テーマ切替はCSS変数（`data-theme`属性）で自動適用。コンポーネントにテーマ関連propを渡さない |

### 日本語と英語の混在ルール

| 場所 | 言語 | 例 |
|-----|------|-----|
| コード（変数名、関数名、型名） | 英語のみ | `calculateXP`, `RoastRecord` |
| UI表示（ユーザー向け） | 日本語 | 「保存しました」「担当表」 |
| コードコメント | 日本語可（英語推奨） | `// 焙煎温度を記録` |
| コミットメッセージ | 日本語（Conventional Commits形式） | `feat(#123): 焙煎タイマーに温度記録機能を追加` |
| テスト記述（describe/it） | 日本語可 | `it('正しいXPを計算する')` |

---

## 用語の追加・変更プロセス

新しいドメイン用語が登場した場合、以下のプロセスで追加する:

1. **提案**: Issue作成またはPRのコメントで用語を提案
2. **議論**: チーム（または開発者）で用語の適切性を確認
3. **承認**: 合意が得られたらこのドキュメントに追加
4. **コード反映**: リファクタリングで既存コードに適用（必要な場合）

---

## 参照

- **コーディング規約**: `docs/steering/GUIDELINES.md`
- **機能一覧**: `docs/steering/FEATURES.md`
- **技術仕様・ADR**: `docs/steering/TECH_SPEC.md`
