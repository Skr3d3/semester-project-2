import { FlatCompat } from "@eslint/eslintrc";
import eslintRecommended from "@eslint/js";

const compat = new FlatCompat({
  recommendedConfig: eslintRecommended.configs.recommended,
});

export default [
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
      node: true,
      jest: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:jest/recommended",
      "plugin:cypress/recommended",
    ],
    overrides: [
      {
        files: ["**/*.cy.js"],
        env: { "cypress/globals": true },
        plugins: ["cypress"],
        rules: {
          "cypress/no-unnecessary-waiting": "off",
          "no-unused-vars": "off",
        },
      },
      {
        files: ["cypress.config.js"],
        rules: {
          "no-undef": "off",
          "no-unused-vars": "off",
        },
      },
    ],
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  }),
];
