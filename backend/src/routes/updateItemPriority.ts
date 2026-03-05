import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const id = req.params.id;
    const priority = req.body.priority;

    const item = await db.updateItemPriority(id as string, priority);
    res.send(item);
};
