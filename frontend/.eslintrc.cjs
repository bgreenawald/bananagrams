/* eslint-env node */

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  rules: {
    // Vue-specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',

    // TypeScript rules - simplified
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // General JavaScript/TypeScript rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-unused-vars': 'off', // handled by @typescript-eslint/no-unused-vars
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.spec.*', '**/*.test.*'],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}
