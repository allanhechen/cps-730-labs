import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (_: Request, res: Response) => {
    const priorities = await db.getPriorities();
    res.send(priorities);
};
