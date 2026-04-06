import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import globals from 'globals'

export default [
  // Base JS recommended
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'public/**',
      'e2e/**',
      'test-results/**',
      'coverage/**',
      '*.config.js',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
    ],
  },

  // TypeScript + React source files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // TypeScript recommended
      ...tsPlugin.configs.recommended.rules,

      // React recommended (JSX transform — no need to import React)
      ...reactPlugin.configs.recommended.rules,
      ...(reactPlugin.configs['jsx-runtime']?.rules ?? {}),

      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // Prettier (disables conflicting rules, then adds prettier as a warn)
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',

      // Project-specific overrides
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      // R3F (React Three Fiber) uses custom JSX props (position, args, castShadow, etc.)
      // that are not standard HTML — TypeScript already validates these
      'react/no-unknown-property': 'off',
      // Closing a drawer/modal on route change via useEffect is intentional UI logic
      'react-hooks/no-direct-set-state-in-use-effect': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // @ts-ignore is used in legacy scene code — allow it
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-undef': 'off', // TypeScript handles this
    },
  },
]
