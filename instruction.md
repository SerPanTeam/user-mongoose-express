npm init -y
npm i express bcrypt mongoose mongodb dotenv jsonwebtoken express-validator
npm i nodemon -D
mkdir config controllers middlewares models routes


npm install -D eslint prettier
npx eslint --init

{
  "printWidth": 80,      // Максимальная ширина строки
  "singleQuote": true,   // Одинарные кавычки вместо двойных
  "semi": true,          // Ставит точку с запятой в конце
  "trailingComma": "all",  // Ставит запятые во всех возможных местах
  "bracketSpacing": true, // Пробелы между { ... } в объектах
  "arrowParens": "always", // Всегда ставим скобки в стрелочных функциях (x) => {}
  "endOfLine": "auto"      // Автоопределение конца строки (CRLF/LF)
}

