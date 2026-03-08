import noRawButton from './no-raw-button.js';
import noRawCheckbox from './no-raw-checkbox.js';
import noRawSelect from './no-raw-select.js';

/** @type {import('eslint').ESLint.Plugin} */
export default {
  rules: {
    'no-raw-button': noRawButton,
    'no-raw-checkbox': noRawCheckbox,
    'no-raw-select': noRawSelect,
  },
};
