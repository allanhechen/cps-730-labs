import db from '../persistence/index';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    await db.removeItem(req.params.id);
    res.sendStatus(200);
};
