import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules for .ts/.vue files
  ...tseslint.configs.recommended,

  // Vue 3 essential rules
  ...pluginVue.configs['flat/recommended'],

  // Project-wide settings
  {
    files: ['src/**/*.{ts,vue}', 'playground/src/**/*.{ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      // Vue — logic rules
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-unused-vars': 'warn',
      // camelCase slot props (:fieldKey, :onUpdate) are intentional
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',

      // Vue — formatting (leave to Prettier if added later)
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'warn',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // General
      'no-console': 'warn',
    },
  },

  // Ignore build output, config files, and docs
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.ts', '*.config.js', 'docs/**'],
  },
)
