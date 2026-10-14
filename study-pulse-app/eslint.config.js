const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['node_modules/**', '.expo/**', 'coverage/**', 'dist/**'],
    rules: {
      // Existing data-fetching hooks intentionally update state from effects.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
