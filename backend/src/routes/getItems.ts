import db from '../persistence/index.js';
import type { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const filters: any = {};
    const { search, priority, categories } = req.query;

    if (typeof search === 'string') {
        filters.search = search;
    }

    if (typeof priority === 'string') {
        const p = parseInt(priority);
        if (!isNaN(p)) {
            filters.priority = p;
        }
    }

    if (categories) {
        if (Array.isArray(categories)) {
            filters.categories = categories
                .map((c) => parseInt(c as string))
                .filter((c) => !isNaN(c));
        } else if (typeof categories === 'string') {
            const c = parseInt(categories);
            if (!isNaN(c)) {
                filters.categories = [c];
            }
        }
    }

    const items = await db.getItems(filters);
    res.send(items);
};
