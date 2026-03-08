/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: '生の <input type="checkbox"> の使用を禁止し、@/components/ui の Checkbox を推奨',
    },
    messages: {
      noRawCheckbox: '生の <input type="checkbox"> を使用しないでください。@/components/ui の Checkbox を使用してください。',
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || '';
    if (filename.replace(/\\/g, '/').includes('components/ui/')) {
      return {};
    }
    return {
      JSXOpeningElement(node) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'input') {
          const typeAttr = node.attributes.find(
            (attr) =>
              attr.type === 'JSXAttribute' &&
              attr.name.name === 'type' &&
              attr.value &&
              attr.value.type === 'Literal' &&
              attr.value.value === 'checkbox'
          );
          if (typeAttr) {
            context.report({ node, messageId: 'noRawCheckbox' });
          }
        }
      },
    };
  },
};
