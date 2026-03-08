/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: '生の <button> 要素の使用を禁止し、@/components/ui の Button/IconButton を推奨',
    },
    messages: {
      noRawButton: '生の <button> を使用しないでください。@/components/ui の Button または IconButton を使用してください。',
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
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'button') {
          context.report({ node, messageId: 'noRawButton' });
        }
      },
    };
  },
};
