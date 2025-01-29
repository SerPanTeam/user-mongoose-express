# Структура проекта

```plaintext
├── config
│   └── db.js
├── controllers
│   └── userController.js
├── middlewares
│   └── errorHandler.js
├── models
│   └── User.js
├── routes
│   └── users.js
├── .env
├── app.js
├── codewr.js
├── combined-files.md
├── index.js
├── instruction.md
├── package-lock.json
└── package.json

```

# Файлы .ts, .tsx, .css

## app.js

```javascript
import usersRouter from "./routes/users.js";
import errorHandler from "./middlewares/errorHandler.js";
import express from "express";
const app = express();
app.use(express.json());
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
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

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
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

```

## index.js

```javascript
import app from "./app.js";
import "dotenv/config.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3333;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

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

## models\User.js

```javascript
"use strict";

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model("User", userSchema);

```

## routes\users.js

```javascript
"use strict";

import {
  createUser,
  getUsers,
  loginUser,
} from "../controllers/userController.js";
import express from "express";
const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/login", loginUser);

export default router;

```

# Дополнительные файлы

⚠️ Файл **index.html** не найден и пропущен.

