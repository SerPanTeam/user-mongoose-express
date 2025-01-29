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
