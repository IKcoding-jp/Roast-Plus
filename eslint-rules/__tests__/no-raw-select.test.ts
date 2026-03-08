import { RuleTester } from 'eslint';
import rule from '../no-raw-select.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-raw-select', rule, {
  valid: [
    // 共通コンポーネントは許可
    { code: '<Select options={opts} />' },
    // components/ui/ 内は除外
    { code: '<select><option>a</option></select>', filename: 'components/ui/Select.tsx' },
    // select以外の要素は検出しない
    { code: '<div>text</div>' },
    { code: '<input type="text" />' },
  ],
  invalid: [
    {
      code: '<select><option>a</option></select>',
      errors: [{ messageId: 'noRawSelect' }],
    },
    {
      code: '<select value={v} onChange={fn}><option>a</option></select>',
      errors: [{ messageId: 'noRawSelect' }],
    },
  ],
});
