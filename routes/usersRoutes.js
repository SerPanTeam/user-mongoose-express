"use strict";

import {
  createUser,
  getUsers,
  loginUser,
} from "../controllers/userController.js";

import {
  userCreationRules,
  validate,
} from "../middlewares/validators/userValidator.js";

import express from "express";
const router = express.Router();

router.get("/", getUsers);
router.post("/", userCreationRules, validate, createUser);
router.post("/login", loginUser);

export default router;
