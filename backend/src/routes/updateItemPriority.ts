import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const id = req.params.id;
    const priority = req.body.priority;

    await db.updateItemPriority(id as string, priority);
    res.sendStatus(204);
};
