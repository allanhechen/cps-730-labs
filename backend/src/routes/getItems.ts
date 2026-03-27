import db from '../persistence/index.js';
import type { Request, Response } from 'express';
import { Priority } from '@todo-app/shared';

/** Filter criteria for querying todo items. */
interface ItemFilters {
    search?: string;
    priority?: Priority;
    categories?: number[];
}

/** Authenticated request with user information attached by Passport. */
interface AuthenticatedRequest extends Request {
    user: { id: string };
}

/**
 * GET /items - Retrieves todo items for the authenticated user.
 * @param req - Express request with optional query params: search (string), priority (number), categories (number or number[]).
 * @param res - Express response containing the filtered list of todo items.
 */
export default async (req: AuthenticatedRequest, res: Response) => {
    const filters: ItemFilters = {};
    const { search, priority, categories } = req.query;

    if (typeof search === 'string') {
        filters.search = search;
    }

    if (typeof priority === 'string') {
        const p = parseInt(priority);
        if (!isNaN(p)) {
            filters.priority = p as Priority;
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

    const items = await db.getItems(req.user.id, filters);
    res.send(items);
};
