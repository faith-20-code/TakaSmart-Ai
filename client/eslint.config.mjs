import { defineConfig } from "eslint/config";
import { createRequire } from "module";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const require = createRequire(import.meta.url);
const nextPlugin = require("@next/eslint-plugin-next");

export default defineConfig([
  {
    plugins: {
      "@next/next": nextPlugin,
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
    },
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]);
