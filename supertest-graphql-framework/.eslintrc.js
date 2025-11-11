module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'jest'
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-constant-condition': ['error', { checkLoops: false }],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error'
  },
  globals: {
    'expect': 'readonly',
    'test': 'readonly',
    'describe': 'readonly',
    'beforeAll': 'readonly',
    'afterAll': 'readonly',
    'beforeEach': 'readonly',
    'afterEach': 'readonly',
    'jest': 'readonly'
  }
};
