import type { Priority } from '@todo-app/shared';
import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await db.updateItem(id, {
        id: id,
        name: req.body.name,
        completed: req.body.completed,
        categories: req.body.categories, // TODO: implement this
        priority: req.body.priority, // TODO: add this in the frontend
        utcDueDate: req.body.utcDueDate, // TODO: implement this
    });
    const item = await db.getItem(id);
    res.send(item);
};
