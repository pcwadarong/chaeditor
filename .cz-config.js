module.exports = {
  types: [
    { value: '✨ feat', name: '✨ feat:     Add a new feature' },
    { value: '🐛 fix', name: '🐛 fix:      Fix a bug' },
    { value: '♻️ refactor', name: '♻️ refactor: Refactor code' },
    { value: '📝 docs', name: '📝 docs:     Update documentation' },
    { value: '⚡ perf', name: '⚡ perf:     Improve performance' },
    { value: '🔧 chore', name: '🔧 chore:    Update tooling or config' },
    { value: '🚀 deploy', name: '🚀 deploy:   Deployment-related change' },
    { value: '🔥 remove', name: '🔥 remove:   Remove code or files' },
    { value: '💄 style', name: '💄 style:    Update UI or styles' },
    { value: '🧪 test', name: '🧪 test:     Add or update tests' },
  ],
  messages: {
    type: 'Select the commit type:',
    subject: 'Write a short imperative summary:',
    body: 'Add optional details. Use "|" for line breaks when you need multiple lines. Press Enter to skip:\n',
    footer: 'Reference related issues if needed (e.g. #123, #456). Press Enter to skip:\n',
    confirmCommit: 'Do you want to create this commit?',
  },
  skipQuestions: ['scope', 'customScope', 'breaking'],
  subjectLimit: 100,
};
