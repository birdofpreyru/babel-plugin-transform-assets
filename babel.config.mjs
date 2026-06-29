export default {
  presets: [
    '@babel/env',
    ['@babel/typescript', {
      // Otherwise TypeScript preset will remove asset imports in tests.
      onlyRemoveTypeImports: true,
    }],
  ],
  targets: 'maintained node versions',
};
