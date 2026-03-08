/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: '生の <select> 要素の使用を禁止し、@/components/ui の Select を推奨',
    },
    messages: {
      noRawSelect: '生の <select> を使用しないでください。@/components/ui の Select を使用してください。',
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
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'select') {
          context.report({ node, messageId: 'noRawSelect' });
        }
      },
    };
  },
};
