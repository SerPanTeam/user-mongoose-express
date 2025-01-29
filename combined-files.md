# Структура проекта

```plaintext
├── config
│   └── db.js
├── controllers
│   └── userController.js
├── middlewares
│   ├── validators
│   │   └── userValidator.js
│   ├── authMiddleware.js
│   └── errorHandler.js
├── models
│   └── User.js
├── routes
│   └── usersRoutes.js
├── .env
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── app.js
├── codewr.js
├── combined-files.md
├── eslint.config.js
├── index.js
├── instruction.md
├── package-lock.json
└── package.json

```

# Файлы .ts, .tsx, .css

## .eslintrc.js

```javascript
export default {
  // Говорим, что код выполняется в Node.js и поддерживает современный JS
  env: {
    node: true,
    es2022: true,
  },
  // Набор базовых конфигураций
  extends: [
    "eslint:recommended", // стандартные правила ESLint
    "airbnb-base", // стиль кода от Airbnb (без React)
    "plugin:prettier/recommended", // включает плагин prettier и отключает конфликтующие правила ESLint
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module", // ESM (import/export)
  },
  rules: {
    // Можно отключить/смягчить правила, которые не подходят в вашем проекте:
    "no-console": "off", // Разрешаем console.log
    "no-unused-vars": "warn", // Предупреждение вместо ошибки
    // Пример настройки импортов, если не используете расширения .js в require:
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
      },
    ],
  },
  ignorePatterns: ["node_modules/", "dist/"],
};

```

## app.js

```javascript
import usersRouter from "./routes/usersRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/users", usersRouter);
app.use(errorHandler);

export default app;

```

## config\db.js

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;

```

## controllers\userController.js

```javascript
"use strict";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // if (!name || !email || !password) {
    //   return res.status(400).json({ error: "All fields are required" });
    // }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    const { password: _, ...rest } = newUser.toObject();
    res.status(201).json({ message: "User created successfully", user: rest });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 часа в мс
    });

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};


// -----------------------------------------------------------
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params; // /api/users/:id
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

import bcrypt from "bcrypt";

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Находим пользователя
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Проверим, имеет ли право данный userId обновлять (например, только сам себя).
    // Если нужна «роль админа», делайте отдельные проверки. Пример:
    // if (req.userId !== id) {
    //   return res.status(403).json({ error: "Forbidden" });
    // }

    const { name, email, password } = req.body;

    // Если приходит новое имя/почта, меняем:
    if (name) user.name = name;
    if (email) user.email = email;

    // Если приходит новый пароль, хешируем:
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Сохраняем обновленного пользователя
    const updatedUser = await user.save();
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    res.json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Точно так же можем проверить, кто удаляет: admin или сам пользователь
    // if (req.userId !== id) {
    //   return res.status(403).json({ error: "Forbidden" });
    // }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};


```

## eslint.config.js

```javascript
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
];
```

## index.js

```javascript
import app from './app.js';
import 'dotenv/config.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3333;

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Функция для "мягкой" остановки
function gracefulShutdown() {
  console.log('Received kill signal, shutting down gracefully...');
  // Перестаём принимать новые подключения
  if (server) {
    server.close(() => {
      console.log('Closed out remaining connections');
      // Закрываем коннект к Mongo
      mongoose.connection.close(false, () => {
        console.log('MongoDb connection closed.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', gracefulShutdown); // Ctrl + C
process.on('SIGTERM', gracefulShutdown); // kill или остановка на сервере

startServer();

```

## middlewares\authMiddleware.js

```javascript
import jwt from "jsonwebtoken";

/**
 * Проверяет наличие JWT в заголовке Authorization (Bearer).
 * Если токен валиден, добавляет в req.userId значение из пэйлоада.
 */
const authMiddleware = (req, res, next) => {
  // Обычно токен передают в заголовке Authorization: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // берем часть после "Bearer"

  if (!token) {
    return res.status(401).json({ error: "Token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // добавляем userId в запрос
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token: " + error });
  }
};

export default authMiddleware;

```

## middlewares\errorHandler.js

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};

export default errorHandler;

```

## middlewares\validators\userValidator.js

```javascript
import { body, validationResult } from "express-validator";

// Набор правил
export const userCreationRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Мидлвар, который проверит результат валидации
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

```

## models\User.js

```javascript
"use strict";

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

```

## routes\usersRoutes.js

```javascript
"use strict";

import express from "express";
import {
  createUser,
  getUsers,
  loginUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Публичные роуты (регистрация, логин):
router.post("/", createUser);        // /api/users  -> Регистрация
router.post("/login", loginUser);    // /api/users/login -> Логин

// Закрытые роуты, только для авторизованных:
router.use(authMiddleware); // все маршруты ниже требуют токен

router.get("/", getUsers);           // /api/users
router.get("/:id", getUser);         // /api/users/:id
router.put("/:id", updateUser);      // /api/users/:id
router.delete("/:id", deleteUser);   // /api/users/:id

export default router;

```

# Дополнительные файлы

⚠️ Файл **index.html** не найден и пропущен.

