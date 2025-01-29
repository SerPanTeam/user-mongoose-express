// eslint.config.js — пример "плоской" конфигурации ESLint 9+
// Убедитесь, что в package.json НЕТ "type": "module" или, наоборот, есть —
// но тогда пишите ES-импорты в этом файле (как ниже).

import { configs as jsConfigs } from "@eslint/js";
import airbnbBase from "eslint-config-airbnb-base";
import pluginImport from "eslint-plugin-import";

import configPrettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

import globals from "globals";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // 1) Базовый блок, указываем, какие файлы проверять
  {
    files: ["**/*.{js,mjs,cjs}"], // если нужно также TS/TSX - добавьте {ts,tsx} и настроите parser
    languageOptions: {
      // Современный JS + Node-глобали
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // даёт доступ к process, __dirname и т.д.
      },
    },
    // Подключаем плагины явно (в старом формате обычно было "plugins": ["import", "prettier"])
    plugins: {
      import: pluginImport,
      prettier: pluginPrettier,
    },
    // Раскладываем ("spread") правила из разных конфигов:
    rules: {
      // Сначала включим рекомендованные правила JS
      ...jsConfigs.recommended.rules,

      // Затем правила от airbnb-base (здесь только объект "rules")
      ...airbnbBase.rules,

      // Наконец, отключаем конфликтующие правила стиля через Prettier
      ...configPrettier.rules,

      // Если хотим, чтобы Prettier проверял код как "правило":
      "prettier/prettier": "error",

      // Своё переопределение:
      "no-console": "off", 
    },
  },
];
