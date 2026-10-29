import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

/**
 * Custom ESLint configuration implementing strict TypeScript quality parameters
 * and automated import structure alignment rules targeted to audited logic files.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/lib/**/*.ts",
      "src/utils/**/*.ts",
      "src/tests/**/*.ts"
    ],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/explicit-function-return-type": ["error", {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true
      }],
      "@typescript-eslint/no-explicit-any": "error",
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "newlines-between": "always"
      }],
      "no-duplicate-imports": "error"
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "vitest.config.ts",
  ]),
]);

export default eslintConfig;
