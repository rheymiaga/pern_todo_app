import { Router, Request, Response } from "express";
import pool from "../db.js";
import type { QueryResult } from "pg";

const router = Router();

// Types
interface TodoInput {
    description: string;
    completed?: boolean;
}

interface Todo {
    todo_id: number;
    description: string;
    completed: boolean;
}

// Create a new todo
router.post("/", async (req: Request, res: Response) => {
    try {
        const body = req.body as unknown as TodoInput;
        const { description, completed = false } = body;

        if (!description) {
            return res.status(400).json({ error: "Description is required" });
        }

        const result: QueryResult<Todo> = await pool.query(
            "INSERT INTO todo (description, completed) VALUES ($1, $2) RETURNING *",
            [description, completed]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        res.status(500).send("Server Error");
    }
});

// Get all todos
router.get("/", async (_req: Request, res: Response) => {
    try {
        const result: QueryResult<Todo> = await pool.query("SELECT * FROM todo");
        res.json(result.rows);
    } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        res.status(500).send("Server Error");
    }
});

// Update todo
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const id = Number((req.params as { id: string }).id);
        const body = req.body as unknown as TodoInput;
        const { description, completed = false } = body;

        if (!description) {
            return res.status(400).json({ error: "Description is required" });
        }

        const result: QueryResult<Todo> = await pool.query(
            "UPDATE todo SET description = $1, completed = $2 WHERE todo_id = $3 RETURNING *",
            [description, completed, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.json({ message: "Todo was updated!", todo: result.rows[0] });
    } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        res.status(500).send("Server Error");
    }
});

// Delete todo
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const id = Number((req.params as { id: string }).id);

        const result: QueryResult<Todo> = await pool.query(
            "DELETE FROM todo WHERE todo_id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.json({ message: "Todo was deleted!", todo: result.rows[0] });
    } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        res.status(500).send("Server Error");
    }
});

export default router;
