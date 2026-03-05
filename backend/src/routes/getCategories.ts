import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (_: Request, res: Response) => {
    const categories = await db.getCategories();
    res.send(categories);
};
