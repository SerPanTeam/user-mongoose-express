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

