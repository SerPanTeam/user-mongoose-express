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
