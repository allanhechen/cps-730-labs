import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const itemId = req.params.itemId;
    const categoryId = req.body.categoryId;

    const item = await db.addItemToCategory(itemId as string, categoryId);
    res.send(item);
};
