import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  pluginJs.configs.recommended,
  
  {
    plugins: ['import'],
    rules: {
      "no-undef": "error", 
      "no-unused-vars": ["error"],
      "import/no-unresolved": ["error"],
    },
  },
];
