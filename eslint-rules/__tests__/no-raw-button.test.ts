import { RuleTester } from 'eslint';
import rule from '../no-raw-button.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-raw-button', rule, {
  valid: [
    // 共通コンポーネントは許可
    { code: '<Button onClick={fn}>text</Button>' },
    { code: '<IconButton onClick={fn}>icon</IconButton>' },
    // components/ui/ 内は除外
    { code: '<button onClick={fn}>text</button>', filename: 'components/ui/Button.tsx' },
    // button以外のHTML要素は検出しない
    { code: '<div onClick={fn}>text</div>' },
    { code: '<a href="#">link</a>' },
  ],
  invalid: [
    {
      code: '<button onClick={fn}>text</button>',
      errors: [{ messageId: 'noRawButton' }],
    },
    {
      code: '<button type="submit">Submit</button>',
      errors: [{ messageId: 'noRawButton' }],
    },
    {
      code: '<button className="px-4 py-2">Styled</button>',
      errors: [{ messageId: 'noRawButton' }],
    },
  ],
});
