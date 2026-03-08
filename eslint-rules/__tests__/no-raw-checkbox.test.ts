import { RuleTester } from 'eslint';
import rule from '../no-raw-checkbox.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-raw-checkbox', rule, {
  valid: [
    // 共通コンポーネントは許可
    { code: '<Checkbox checked={v} onChange={fn} />' },
    // components/ui/ 内は除外
    { code: '<input type="checkbox" />', filename: 'components/ui/Checkbox.tsx' },
    // type が checkbox 以外の input は検出しない
    { code: '<input type="text" />' },
    { code: '<input type="email" />' },
    { code: '<input type="number" />' },
    // type指定なしの input も検出しない（デフォルトはtext）
    { code: '<input />' },
  ],
  invalid: [
    {
      code: '<input type="checkbox" />',
      errors: [{ messageId: 'noRawCheckbox' }],
    },
    {
      code: '<input type="checkbox" checked={v} onChange={fn} />',
      errors: [{ messageId: 'noRawCheckbox' }],
    },
  ],
});
