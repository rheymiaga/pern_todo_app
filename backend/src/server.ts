import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import todoRoutes from "./routes/todos.js";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;

const app: Application = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
app.use(express.json());

// Health check route
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Todo routes
app.use("/todos", todoRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
