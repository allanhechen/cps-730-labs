import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const categories = await db.getCategories((req as any).user.id);
    res.send(categories);
};
