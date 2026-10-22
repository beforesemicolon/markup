import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [
    { ignores: ['src/**/*.spec.ts', '.netlify/**', '**/.*'] },
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx,mts,cts}'],
        languageOptions: { parser: tsParser, sourceType: 'module' },
        plugins: { '@typescript-eslint': tsPlugin },
        rules: {
            ...js.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            ...prettier.rules,
            'no-prototype-builtins': 'off',
            'no-constant-condition': ['error', { checkLoops: 'all' }],
            // Retain checks from the previous recommended configuration.
            'no-inner-declarations': [
                'error',
                'functions',
                { blockScopedFunctions: 'disallow' },
            ],
            // ban-types also rejected empty object types inside intersections.
            '@typescript-eslint/no-restricted-types': [
                'error',
                {
                    types: {
                        '{}': 'Use a specific object type or unknown instead.',
                    },
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { caughtErrors: 'none' },
            ],
            '@typescript-eslint/no-unused-expressions': [
                'error',
                { allowShortCircuit: true },
            ],
        },
    },
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        rules: {
            ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
            // These checks were enabled before the typescript-eslint upgrade.
            'no-class-assign': 'error',
            'no-with': 'error',
        },
    },
]
