import db from '../persistence/index.js';
import type { Request, Response } from 'express';
import { Priority } from '@todo-app/shared';

export default async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await db.updateItem(id, {
        id: id,
        name: req.body.name,
        completed: req.body.completed,
        categories: req.body.categories, // TODO: implement this
        priority: req.body.priority as Priority, // TODO: add this in the frontend
        utcDueDate: req.body.utcDueDate, // TODO: implement this
    }, (req as any).user.id);
    const item = await db.getItem(id, (req as any).user.id);
    res.send(item);
};
