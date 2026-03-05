import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const items = await db.getItems();
    res.send(items);
};
