import db from '../persistence/index.js';
import { v4 as uuid } from 'uuid';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };

    await db.storeItem(item);
    res.send(item);
};
