/**
 * Lint-staged Configuration
 * Pre-commit hook için sadece değişen dosyaları lint/format et
 */

module.exports = {
  '*.js': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ]
};

