# CI/CD 段階的強化 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** CI/CDパイプラインをパフォーマンス最適化・品質チェック統合・デプロイ強化の3フェーズで段階的に改善する

**Architecture:** 既存の `ci.yml` と `firebase-hosting-merge.yml` を段階的に拡張。installジョブでの依存キャッシュ共有、qualityジョブの追加、PRプレビューデプロイとCloud Functions自動デプロイを追加する

**Tech Stack:** GitHub Actions, Firebase Hosting (Preview Channels), Firebase CLI, actions/cache, actions/upload-artifact

---

## Phase 1: パフォーマンス最適化

### Task 1: installジョブの追加とnode_modulesアーティファクト共有

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: ci.ymlにinstallジョブを追加し、既存ジョブをrefactor**

ci.ymlを以下の構造に書き換える:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  install:
    name: Install Dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - uses: actions/upload-artifact@v4
        with:
          name: node-modules
          path: node_modules
          retention-days: 1

  lint:
    name: Lint
    runs-on: ubuntu-latest
    needs: install
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: actions/download-artifact@v4
        with:
          name: node-modules
          path: node_modules
      - run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: install
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: actions/download-artifact@v4
        with:
          name: node-modules
          path: node_modules
      - run: npm run test:run

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: install
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: actions/download-artifact@v4
        with:
          name: node-modules
          path: node_modules
      - name: Cache Playwright Browsers
        id: playwright-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ hashFiles('package-lock.json') }}
      - name: Install Playwright Browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps chromium
      - name: Install Playwright System Dependencies
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps chromium
      - name: Run E2E tests
        run: npx playwright test --project=chromium
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: e2e-test-api-key
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: e2e-test.firebaseapp.com
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: e2e-test-project
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: e2e-test.appspot.com
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '000000000000'
          NEXT_PUBLIC_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000'
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: install
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: actions/download-artifact@v4
        with:
          name: node-modules
          path: node_modules
      - run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

  ci-gate:
    name: CI Gate
    runs-on: ubuntu-latest
    needs: [lint, test, e2e, build]
    if: always()
    steps:
      - name: Check all jobs
        run: |
          if [[ "${{ needs.lint.result }}" != "success" || "${{ needs.test.result }}" != "success" || "${{ needs.e2e.result }}" != "success" || "${{ needs.build.result }}" != "success" ]]; then
            echo "One or more jobs failed"
            exit 1
          fi
          echo "All jobs passed"
```

**Step 2: PRを作成してCIが正しく動作するか確認**

Run: `gh pr create` で PR を作成
Expected: installジョブ → 4ジョブ並列 → ci-gate の順に実行される

**Step 3: CI実行時間を確認**

GitHub Actions UIでinstallジョブの所要時間と、各ジョブの
アーティファクト復元時間を確認。改善前後を比較。

**Step 4: コミット**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: installジョブ追加でnpm ci重複実行を排除"
```

---

## Phase 2: 品質チェック統合

### Task 2: テストカバレッジレポートの追加

**Files:**
- Modify: `.github/workflows/ci.yml` (testジョブ)

**Step 1: testジョブにカバレッジ出力を追加**

testジョブの `npm run test:run` を `npm run test:coverage` に変更し、
カバレッジレポートをアーティファクトとしてアップロード:

```yaml
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: install
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: actions/download-artifact@v4
        with:
          name: node-modules
          path: node_modules
      - run: npm run test:coverage -- --reporter=json --outputFile=test-results.json
      - name: Coverage Report
        if: always()
        uses: davelosert/vitest-coverage-report-action@v2
        with:
          json-summary-path: coverage/coverage-summary.json
          json-final-path: coverage/coverage-final.json
```

**Step 2: トップレベルの permissions を更新**

ci.yml のトップレベル permissions に `pull-requests: write` を追加:

```yaml
permissions:
  contents: read
  pull-requests: write
```

**Step 3: コミット**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: テストカバレッジレポートをPRコメントに自動投稿"
```

### Task 3: qualityジョブの追加

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: qualityジョブを追加**

ci.ymlに新しいqualityジョブを追加:

```yaml
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    needs: install
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - uses: actions/download-artifact@v4
        with:
          name: node-modules
          path: node_modules
      - name: Cyclomatic Complexity
        run: |
          pip install lizard
          npm run complexity
      - name: Dead Code Detection
        run: npm run deadcode || true
      - name: Security Audit
        run: npm audit --audit-level=high || true
```

注意: `continue-on-error: true` で quality が失敗しても ci-gate には影響しない。
ci-gate の needs には quality を含めない（情報提供のみ）。

**Step 2: コミット**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: 品質チェックジョブ追加（complexity, deadcode, security）"
```

---

## Phase 3: デプロイ強化

### Task 4: PRプレビューデプロイの追加

**Files:**
- Create: `.github/workflows/firebase-hosting-preview.yml`

**Step 1: PRプレビューデプロイ用ワークフローを作成**

```yaml
name: Deploy Preview to Firebase Hosting

on:
  pull_request:
    branches: [main]

permissions:
  checks: write
  contents: read
  pull-requests: write

jobs:
  preview-deploy:
    name: Preview Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_ROASTPLUS_72FA6 }}
          projectId: roastplus-72fa6
          expires: 7d
```

注意: `channelId` を指定しないことで、PRごとに自動でプレビューチャネルが作成される。
`expires: 7d` で7日後に自動削除。

**Step 2: コミット**

```bash
git add .github/workflows/firebase-hosting-preview.yml
git commit -m "ci: PRプレビューデプロイ（Firebase Preview Channel）を追加"
```

### Task 5: Cloud Functions 自動デプロイの追加

**Files:**
- Modify: `.github/workflows/firebase-hosting-merge.yml`

**Step 1: マージ時ワークフローにCloud Functionsデプロイジョブを追加**

firebase-hosting-merge.yml を拡張:

```yaml
name: Deploy to Firebase on merge

on:
  pull_request:
    types: [closed]
    branches:
      - main

permissions:
  checks: write
  contents: read
  pull-requests: write

jobs:
  build_and_deploy:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_ROASTPLUS_72FA6 }}
          channelId: live
          projectId: roastplus-72fa6

  health_check:
    name: Health Check
    runs-on: ubuntu-latest
    needs: build_and_deploy
    steps:
      - name: Wait for deployment propagation
        run: sleep 30
      - name: Check site availability
        run: |
          for i in 1 2 3; do
            if curl -sf https://roastplus-72fa6.web.app/ > /dev/null; then
              echo "Site is healthy"
              exit 0
            fi
            echo "Attempt $i failed, retrying in 10s..."
            sleep 10
          done
          echo "Site health check failed after 3 attempts"
          exit 1

  deploy_functions:
    name: Deploy Cloud Functions
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - name: Check for functions changes
        id: changes
        run: |
          if git diff HEAD~1 --name-only | grep -q '^functions/'; then
            echo "changed=true" >> $GITHUB_OUTPUT
          else
            echo "changed=false" >> $GITHUB_OUTPUT
          fi
      - uses: actions/setup-node@v4
        if: steps.changes.outputs.changed == 'true'
        with:
          node-version: 20
      - name: Install Functions dependencies
        if: steps.changes.outputs.changed == 'true'
        run: cd functions && npm ci
      - name: Deploy Functions
        if: steps.changes.outputs.changed == 'true'
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_ROASTPLUS_72FA6 }}
          PROJECT_ID: roastplus-72fa6
```

注意:
- `deploy_functions` は `build_and_deploy` とは独立して並列実行
- `fetch-depth: 2` で直前コミットとの差分を取得
- functions のNode.jsバージョンは20（firebase.jsonの `runtime: nodejs20` に合わせる）
- functions変更がない場合はスキップ

**Step 2: コミット**

```bash
git add .github/workflows/firebase-hosting-merge.yml
git commit -m "ci: Cloud Functions自動デプロイとヘルスチェックを追加"
```

---

## 検証計画

各フェーズのPRマージ後に以下を確認:

### Phase 1 検証
- [ ] installジョブが正常に完了する
- [ ] 4ジョブがアーティファクトから node_modules を復元できる
- [ ] Playwright ブラウザキャッシュが機能する
- [ ] CI Gate が全ジョブの結果を正しくチェックする
- [ ] 合計実行時間が改善される

### Phase 2 検証
- [ ] カバレッジレポートがPRコメントに投稿される
- [ ] quality ジョブが実行される（失敗してもCI全体は通る）
- [ ] complexity / deadcode / security の結果がログに表示される

### Phase 3 検証
- [ ] PRにプレビューURLがコメントされる
- [ ] プレビューサイトが正しく表示される
- [ ] functions/ 変更を含むPRマージ時にCloud Functionsがデプロイされる
- [ ] functions/ 変更なしのPRマージ時にFunctionsデプロイがスキップされる
- [ ] ヘルスチェックがデプロイ後に実行される
