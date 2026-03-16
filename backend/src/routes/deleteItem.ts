import db from '../persistence/index';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await db.removeItem(id, (req as any).user.id);
    res.sendStatus(200);
};
