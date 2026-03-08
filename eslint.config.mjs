import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import localRules from "./eslint-rules/index.js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".history/**",
    // Ignore compiled Firebase Functions output
    "functions/lib/**",
    // Ignore Claude/Codex skill examples
    ".claude/**",
    ".codex/**",
    // Ignore coverage reports
    "coverage/**",
    // Ignore E2E tests (Playwright, not React)
    "e2e/**",
    // Ignore ESLint rule source files
    "eslint-rules/**",
  ]),
  // ローカルカスタムルール: 共通UIコンポーネントの使用を強制
  {
    plugins: { local: localRules },
    rules: {
      "local/no-raw-button": "warn",
      "local/no-raw-checkbox": "warn",
      "local/no-raw-select": "warn",
    },
  },
  // デザインラボのモックアップは共通UIルール除外
  {
    files: ["app/dev/design-lab/**"],
    rules: {
      "local/no-raw-button": "off",
      "local/no-raw-checkbox": "off",
      "local/no-raw-select": "off",
    },
  },
]);

export default eslintConfig;
