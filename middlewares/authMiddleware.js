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
