module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6, // 指定你使用的 ECMAScript 版本
    sourceType: 'module', // 代码是 ECMAScript 模块
    ecmaFeatures: {
      // 额外的语言特性
      jsx: true,
      experimentalObjectRestSpread: true, // 支持新的es7属性
    },
  },
  env: {
    es6: true, // 启用除了 modules 以外的所有 ECMAScript 6 特性（该选项会自动设置 ecmaVersion 解析器选项为 6
    browser: true, // 浏览器环境中的全局变量
    node: true,
  },
  extends: ['plugin:@typescript-eslint/recommended'], // 核心规则
  globals: {
    // 全局变量
    lz: true,
  },
  plugins: [
    // 第三方插件
    '@typescript-eslint',
    'react-hooks',
  ],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'no-console': 'off',
    'generator-star-spacing': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-var-requires': 'off'
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
