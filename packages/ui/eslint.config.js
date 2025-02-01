import baseConfig from "@ars/eslint-config/base";
import reactConfig from "@ars/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];
