import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const name = req.body.name;

    try {
        const categoryId = await db.addCategory(name);
        res.send({
            id: categoryId,
            name,
        });
    } catch {
        res.sendStatus(400);
    }
};
