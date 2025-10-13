import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { dirname } from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * ESLint config for the Next.js app.
 * Extends shared monorepo config and adds Next's built-ins.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const config = [
  // Apply ESLint's recommended rules and Prettier configuration.
  js.configs.recommended,
  eslintConfigPrettier,
  // Apply TypeScript's recommended rules.
  ...tseslint.configs.recommended,
  {
    rules: {
      semi: ["error"],
      "no-console": ["warn"],
      "prefer-const": ["error"],
      "jsx-quotes": ["error", "prefer-double"],
      quotes: ["error", "double"],
      "no-unused-vars": ["error"],
    },
  },
  // Apply React's recommended rules and the react-hooks rules.
  {
    ...pluginReact.configs.flat.recommended,
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": pluginReactHooks,
      "jsx-a11y": eslintPluginJsxA11y,
    },
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Include all recommended jsx-a11y rules here
      ...eslintPluginJsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  // Here, add next/core-web-vitals using compat. The next deps live in THIS package.
  ...compat.extends("next", "next/core-web-vitals", "next/typescript"),
];

export default config;
