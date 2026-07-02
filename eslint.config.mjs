import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

function getSubConfigs(folder, prefix, isLib) {
  const filesPattern = isLib
    ? [`libs/${folder}/**/*.ts`, `libs/${folder}/**/*.tsx`]
    : [`apps/${folder}/**/*.ts`, `apps/${folder}/**/*.tsx`];

  const classPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);

  const rules = {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['class', 'interface', 'typeAlias'],
        modifiers: ['exported'],
        format: ['PascalCase'],
        prefix: [classPrefix],
      },
      {
        selector: ['function'],
        modifiers: ['exported'],
        // define as PascalCase because the prefix is not included in the format check
        // so if the name is e.g. "flMyFunction" it will still be valid because it checks for "MyFunction"
        format: ['PascalCase'],
        prefix: [prefix],
      },
      {
        selector: ['variable'],
        modifiers: ['exported'],
        format: ['UPPER_CASE'],
        prefix: [prefix.toUpperCase() + '_'],
      },
    ],
  };

  return {
    files: filesPattern,
    rules: rules,
  };
}

export default tseslint.config(
  // Base configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  // Ignore patterns
  {
    ignores: ['eslint.config.mjs', 'node_modules', 'dist'],
  },

  // Language and plugins configuration
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
  },

  // Global rules
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],

    rules: {
      indent: 'off',

      'max-len': [
        'error',
        {
          code: 110,
          ignorePattern: '^(import|\\} from) .*',
        },
      ],

      'no-case-declarations': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
        },
      ],

      'no-extra-semi': 'off',

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],

      'simple-import-sort/imports': 'error',
    },
  },

  // App and library-specific configurations

  // Apps
  getSubConfigs('cn-space-api', 'cn', false),
  getSubConfigs('hn-community-api', 'hn', false),

  // Libraries
  getSubConfigs('back-core-lib', 'bl', true),
  getSubConfigs('core-lib', 'cl', true),
  getSubConfigs('te-text-editor', 'te', true),

  // Test-support files are not part of the app's public API and use plain,
  // un-prefixed names (e.g. the `JSDOM` stub must match the real jsdom export,
  // TestConfigService, TEST_ADMIN_*). Exempt them from the prefix rule.
  {
    files: ['apps/*/test/**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  }
);
