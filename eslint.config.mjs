import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // NFR-6.1: Enforce SDK access through wrapper only
      "no-restricted-imports": ["error", {
        "patterns": [{
          "group": ["@anthropic-ai/claude-agent-sdk"],
          "message": "Import from src/lib/sdk instead. Direct SDK imports are not allowed (NFR-6.1)."
        }]
      }],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "src-tauri/**",
      "tests/**",
      "design-system/**",
      "*.config.*",
    ],
  },
];
