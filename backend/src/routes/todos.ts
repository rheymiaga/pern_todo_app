import { Router } from "express";
import pool from "../db.js";
import type { Request, Response } from 'express'
import { QueryResult } from "pg";

const router = Router()

//Create a new todo
interface TodoInput { description: string; completed: boolean; }
interface Todo { todo_id: number; description: string; completed: boolean; }

router.post('/', async (req: Request, res: Response) => {
    try {
        const { description, completed } = req.body as TodoInput
        if (!description) {
            return res.status(400).json({ error: "Description is required" })
        }

        const newTodo: QueryResult<Todo> = await pool.query(
            "INSERT INTO todo (description, completed) VALUES ($1, $2) RETURNING *",
            [description, completed || false]
        )
        res.json(newTodo.rows[0])
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error(String(err));
        }
        res.status(500).send("Server Error");
    }
})

//get all todos
router.get("/", async (req: Request, res: Response) => {
    try {
        const allTodos: QueryResult<Todo> = await pool.query("SELECT * FROM todo");
        res.json(allTodos.rows);
        
    } catch (err) {
        if (err instanceof Error) { console.error(err.message); }
        else { console.error(String(err)); } res.status(500).send("Server Error");
    }
});

//update todo
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { description, completed } = req.body as TodoInput

        if (!description) {
            return res.status(400).json({ error: "Description is required" })
        }
        const updateTodo: QueryResult<Todo> = await pool.query(
            "UPDATE todo SET description = $1, completed = $2 WHERE todo_id = $3 RETURNING *",
            [description, completed || false, id]
        )
        if (updateTodo.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" })
        }
        res.json({
            message: 'Todo was updated!',
            todo: updateTodo.rows[0]
        })

    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error(String(err));
        }
        res.status(500).send("Server Error");
    }
})

//delete todo
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const deletedTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1 RETURNING *", [id])
        res.json("Todo was deleted!")
        if (deletedTodo.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" })
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error(String(err));
        }
        res.status(500).send("Server Error");
    }
})


export default router