/* eslint-disable import/no-extraneous-dependencies */

import { defineConfig } from 'eslint/config';
import eslintConfigs from '@dr.pogodin/eslint-configs';

export default defineConfig([
  { ignores: ['build/', 'test/fixtures/'] },
  eslintConfigs.configs.javascript,
  // TODO: Enable these once the codebase is migrated to TypeScript,
  // and tests are migrated to Jest.
  /*
  eslintConfigs.configs.typescript,
  {
    extends: [eslintConfigs.configs.jest],
    files: ['test/**'],
  },
  */
]);
