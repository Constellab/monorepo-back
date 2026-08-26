import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
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
    // Root-level .mjs files are standalone tooling scripts (this config, the
    // deploy script) that no tsconfig includes, so the type-aware parser
    // cannot resolve them.
    ignores: ['*.mjs', 'node_modules', 'dist'],
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
      sonarjs,
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

      // Method complexity budgets. `variant: 'modified'` counts a whole `switch`
      // as one path, so mapping tables (status enums, file-icon lookups) are not
      // punished for having many cases; cognitive-complexity then weights nesting.
      complexity: ['error', { max: 10, variant: 'modified' }],
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-depth': ['error', 4],
      'max-statements': ['error', 25],
      'max-nested-callbacks': ['error', 3],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],

      // `max-params` cannot exempt constructors, and NestJS DI constructors
      // legitimately take many. Restrict the parameter count on everything else.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MethodDefinition[kind!="constructor"] > FunctionExpression[params.length>6]',
          message: 'This method takes more than 6 parameters. Pass an options object instead.',
        },
        {
          selector: 'FunctionDeclaration[params.length>6]',
          message: 'This function takes more than 6 parameters. Pass an options object instead.',
        },
      ],
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
  },

  // A spec is a flat list of arrange/act/assert steps, so its length and
  // statement count say nothing about complexity, and `describe > describe >
  // it > callback` already nests four deep. The branching budgets still apply:
  // no test in the repo exceeds a cognitive complexity of 8.
  {
    files: ['**/*.spec.ts', 'apps/*/test/**/*.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'max-nested-callbacks': 'off',
    },
  }
);
