import baseConfig, { restrictEnvAccess } from "@ars/eslint-config/base";
import nextjsConfig from "@ars/eslint-config/nextjs";
import reactConfig from "@ars/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
