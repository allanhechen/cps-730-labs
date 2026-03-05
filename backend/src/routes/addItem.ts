import db from '../persistence/index.js';
import { v4 as uuid } from 'uuid';
import type { Request, Response } from 'express';
import { priorityMap, type Todo } from '@todo-app/shared';

export default async (req: Request, res: Response) => {
    const item: Todo = {
        id: uuid(),
        name: req.body.name,
        completed: false,
        priority: priorityMap.NONE,
        categories: [],
    };

    await db.storeItem(item);
    res.send(item);
};
