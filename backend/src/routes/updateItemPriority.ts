import db from '../persistence/index.js';
import type { Request, Response } from 'express';
import { Priority } from '@todo-app/shared';

export default async (req: Request, res: Response) => {
    const id = req.params.id;
    const priority = req.body.priority as Priority;

    const item = await db.updateItemPriority(id as string, priority, (req as any).user.id);
    res.send(item);
};
