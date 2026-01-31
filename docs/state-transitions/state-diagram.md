# RoastPlus - アプリケーション状態遷移図

## 全体構造図

```mermaid
graph TB
    %% エントリーポイント
    Start([アプリ起動]) --> CheckAuth{認証状態}

    %% 認証フロー
    CheckAuth -->|未ログイン| Login[/login<br/>ログイン画面]
    CheckAuth -->|ログイン済み| CheckConsent{同意確認}
    CheckConsent -->|同意未完了| Consent[/consent<br/>同意画面]
    CheckConsent -->|同意済み| Home[/<br/>ホーム画面]

    Login -->|認証成功| CheckConsent
    Consent -->|同意完了| Home

    %% ホームからの遷移（メインナビゲーション）
    Home --> Assignment[/assignment<br/>担当表]
    Home --> Schedule[/schedule<br/>スケジュール]
    Home --> Tasting[/tasting<br/>試飲感想記録]
    Home --> RoastTimer[/roast-timer<br/>ローストタイマー]
    Home --> DefectBeans[/defect-beans<br/>コーヒー豆図鑑]
    Home --> Progress[/progress<br/>作業進捗]
    Home --> DripGuide[/drip-guide<br/>ドリップガイド]
    Home --> CoffeeTrivia[/coffee-trivia<br/>コーヒークイズ]
    Home --> DevStories[/dev-stories<br/>開発秘話]
    Home --> Settings[/settings<br/>設定]

    %% その他のページ
    Home --> Clock[/clock<br/>時計]
    Home --> Notifications[/notifications<br/>通知]

    %% 設定からの遷移
    Settings --> SettingsFont[/settings/font<br/>フォント設定]
    Settings --> SettingsTheme[/settings/theme<br/>テーマ設定]
    Settings --> Changelog[/changelog<br/>更新履歴]
    Settings --> Contact[/contact<br/>お問い合わせ]
    Settings --> Privacy[/privacy-policy<br/>プライバシーポリシー]
    Settings --> Terms[/terms<br/>利用規約]
    Settings --> Brewing[/brewing<br/>抽出記録]
    Settings --> RoastRecord[/roast-record<br/>焙煎記録]
    Settings --> UITest[/ui-test<br/>UIテスト]
    Settings --> Tools[/tools/counter<br/>カウンター]

    %% スタイリング
    classDef authClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    classDef homeClass fill:#dbeafe,stroke:#3b82f6,stroke-width:3px
    classDef mainClass fill:#d1fae5,stroke:#10b981,stroke-width:2px
    classDef subClass fill:#e0e7ff,stroke:#6366f1,stroke-width:1px

    class Login,Consent authClass
    class Home homeClass
    class Assignment,Schedule,Tasting,RoastTimer,DefectBeans,Progress,DripGuide,CoffeeTrivia,DevStories,Settings mainClass
    class SettingsFont,SettingsTheme,Changelog,Contact,Privacy,Terms,Brewing,RoastRecord,UITest,Tools,Clock,Notifications subClass
```

## 主要機能別の詳細遷移図

### 1. テイスティング機能

```mermaid
graph TB
    Home[/<br/>ホーム] --> Tasting[/tasting<br/>試飲感想記録トップ]

    Tasting -->|新規セッション作成| NewSession[/tasting/sessions/new<br/>セッション新規作成]
    Tasting -->|セッション選択| SessionDetail[/tasting/sessions/[id]<br/>セッション詳細]
    Tasting -->|記録選択| RecordDetail[/tasting/[id]<br/>記録詳細]

    NewSession -->|作成完了| Tasting
    NewSession -->|キャンセル| Tasting

    SessionDetail -->|編集| EditSession[/tasting/sessions/[id]/edit<br/>セッション編集]
    SessionDetail -->|新規記録追加| NewRecord[/tasting/sessions/[id]/records/new<br/>記録新規作成]
    SessionDetail -->|削除| Tasting
    SessionDetail -->|戻る| Tasting

    EditSession -->|保存| SessionDetail
    EditSession -->|キャンセル| SessionDetail

    NewRecord -->|作成完了| SessionDetail
    NewRecord -->|キャンセル| SessionDetail

    RecordDetail -->|削除| Tasting
    RecordDetail -->|戻る| Tasting

    classDef tastingClass fill:#fecaca,stroke:#dc2626,stroke-width:2px
    class Tasting,NewSession,SessionDetail,EditSession,NewRecord,RecordDetail tastingClass
```

### 2. ドリップガイド機能

```mermaid
graph TB
    Home[/<br/>ホーム] --> DripGuide[/drip-guide<br/>レシピ一覧]

    DripGuide -->|新規レシピ作成| NewRecipe[/drip-guide/new<br/>レシピ新規作成]
    DripGuide -->|レシピ編集| EditRecipe[/drip-guide/edit<br/>レシピ編集]
    DripGuide -->|レシピ実行| RunRecipe[/drip-guide/run<br/>レシピ実行]

    NewRecipe -->|保存| DripGuide
    NewRecipe -->|キャンセル| DripGuide

    EditRecipe -->|保存| DripGuide
    EditRecipe -->|削除| DripGuide
    EditRecipe -->|キャンセル| DripGuide

    RunRecipe -->|完了| DripGuide
    RunRecipe -->|中断| DripGuide
    RunRecipe -->|戻る| DripGuide

    classDef dripClass fill:#d1fae5,stroke:#059669,stroke-width:2px
    class DripGuide,NewRecipe,EditRecipe,RunRecipe dripClass
```

### 3. コーヒークイズ機能

```mermaid
graph TB
    Home[/<br/>ホーム] --> CoffeeTrivia[/coffee-trivia<br/>クイズトップ]

    CoffeeTrivia -->|カテゴリ選択| Category[/coffee-trivia/category/[category]<br/>カテゴリ別問題一覧]
    CoffeeTrivia -->|クイズ開始| Quiz[/coffee-trivia/quiz<br/>クイズ実行]
    CoffeeTrivia -->|復習| Review[/coffee-trivia/review<br/>復習モード]
    CoffeeTrivia -->|統計| Stats[/coffee-trivia/stats<br/>統計情報]
    CoffeeTrivia -->|バッジ| Badges[/coffee-trivia/badges<br/>バッジ一覧]

    Category -->|順次モード| Quiz
    Category -->|シャッフルモード| Quiz
    Category -->|カテゴリ別モード| Quiz
    Category -->|戻る| CoffeeTrivia

    Quiz -->|完了| CoffeeTrivia
    Quiz -->|完了| Category

    Review -->|戻る| CoffeeTrivia
    Stats -->|戻る| CoffeeTrivia
    Badges -->|戻る| CoffeeTrivia

    classDef quizClass fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    class CoffeeTrivia,Category,Quiz,Review,Stats,Badges quizClass
```

### 4. 開発秘話機能

```mermaid
graph TB
    Home[/<br/>ホーム] --> DevStories[/dev-stories<br/>エピソード一覧]

    DevStories -->|エピソード選択| Episode[/dev-stories/[id]<br/>エピソード詳細]

    Episode -->|前のエピソード| PrevEpisode[/dev-stories/[prevId]<br/>前のエピソード]
    Episode -->|次のエピソード| NextEpisode[/dev-stories/[nextId]<br/>次のエピソード]
    Episode -->|戻る| DevStories

    PrevEpisode -.->|ナビゲーション| Episode
    NextEpisode -.->|ナビゲーション| Episode

    classDef storiesClass fill:#e0e7ff,stroke:#6366f1,stroke-width:2px
    class DevStories,Episode,PrevEpisode,NextEpisode storiesClass
```

### 5. ローストタイマー機能

```mermaid
graph TB
    Home[/<br/>ホーム] --> RoastTimer[/roast-timer<br/>タイマートップ]

    RoastTimer -->|タイマー開始| TimerRunning[タイマー実行中]
    RoastTimer -->|設定| TimerSettings[設定モーダル]
    RoastTimer -->|記録保存| SaveRecord[記録保存]

    TimerRunning -->|完了| RoastTimer
    TimerRunning -->|リセット| RoastTimer

    TimerSettings -->|保存| RoastTimer
    TimerSettings -->|キャンセル| RoastTimer

    SaveRecord -->|保存完了| RoastTimer

    RoastTimer -->|戻る| Home

    classDef timerClass fill:#fed7aa,stroke:#ea580c,stroke-width:2px
    class RoastTimer,TimerRunning,TimerSettings,SaveRecord timerClass
```

## ページ一覧（全33ページ）

### 認証関連
- `/login` - ログイン画面
- `/consent` - 同意画面

### メインページ
- `/` - ホーム画面（10機能へのナビゲーション）

### 主要機能（ホームからアクセス）
1. `/assignment` - 担当表
2. `/schedule` - スケジュール
3. `/tasting` - 試飲感想記録トップ
4. `/roast-timer` - ローストタイマー
5. `/defect-beans` - コーヒー豆図鑑
6. `/progress` - 作業進捗
7. `/drip-guide` - ドリップガイド
8. `/coffee-trivia` - コーヒークイズトップ
9. `/dev-stories` - 開発秘話
10. `/settings` - 設定・その他

### テイスティング関連（5ページ）
- `/tasting/sessions/new` - セッション新規作成
- `/tasting/sessions/[id]` - セッション詳細
- `/tasting/sessions/[id]/edit` - セッション編集
- `/tasting/sessions/[id]/records/new` - 記録新規作成
- `/tasting/[id]` - 記録詳細

### ドリップガイド関連（3ページ）
- `/drip-guide/new` - レシピ新規作成
- `/drip-guide/edit` - レシピ編集
- `/drip-guide/run` - レシピ実行

### コーヒークイズ関連（5ページ）
- `/coffee-trivia/quiz` - クイズ実行
- `/coffee-trivia/category/[category]` - カテゴリ別問題一覧
- `/coffee-trivia/review` - 復習モード
- `/coffee-trivia/stats` - 統計情報
- `/coffee-trivia/badges` - バッジ一覧

### 開発秘話関連（1ページ）
- `/dev-stories/[id]` - エピソード詳細

### 設定関連（10ページ）
- `/settings/font` - フォント設定
- `/settings/theme` - テーマ設定
- `/changelog` - 更新履歴
- `/contact` - お問い合わせ
- `/privacy-policy` - プライバシーポリシー
- `/terms` - 利用規約
- `/brewing` - 抽出記録
- `/roast-record` - 焙煎記録
- `/ui-test` - UIテスト（開発者向け）
- `/tools/counter` - カウンター

### その他（2ページ）
- `/clock` - 時計
- `/notifications` - 通知

## 主要な遷移パターン

### 認証ガード
すべてのページは以下の認証フローを経由：
```
未ログイン → /login → 認証成功 → /consent（初回のみ） → 目的のページ
```

### 戻るボタンの挙動
- 各機能詳細ページ → 機能トップページ
- 機能トップページ → ホーム（一部例外あり）
- ホーム → アプリ終了

### クエリパラメータによる遷移
- `returnUrl`: ログイン後のリダイレクト先
- `recordId`: 特定の記録を開く
- `sessionId`: 特定のセッションを開く
- `edit=true`: 編集モードで開く
- `mode`: クイズのモード指定
- `category`: カテゴリ指定

## 技術的な遷移手法

### 使用されているナビゲーション方法
1. **Link コンポーネント** (next/link)
   - 静的なナビゲーション
   - 例: ホームページのACTIONS配列

2. **router.push()** (useRouter)
   - 動的・条件付きナビゲーション
   - 認証後のリダイレクト
   - データ操作後の遷移

3. **router.back()**
   - 戻るボタン

4. **条件付きリダイレクト**
   - useEffect内での認証チェック
   - 同意確認チェック

