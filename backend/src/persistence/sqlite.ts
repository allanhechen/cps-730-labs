import sqlite3 from 'sqlite3';
sqlite3.verbose();
import { open, type Database } from 'sqlite';
import fs from 'fs';
import path from 'path';
import type { Category, Todo } from '@todo-app/shared';
import { Priority } from '@todo-app/shared';

let db: Database;

async function init(location: string): Promise<void> {
    const dirName = path.dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    db = await open({
        filename: location,
        driver: sqlite3.Database,
    });

    await db.run(
        'CREATE TABLE IF NOT EXISTS users (id varchar(255) primary key, email varchar(255), name varchar(255))',
    );
    await db.run(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, priority integer, utcDueDate text, user_id varchar(255) references users)',
    );
    await db.run(
        'CREATE TABLE IF NOT EXISTS categories (id integer primary key, name varchar(255), user_id varchar(255) references users, UNIQUE(name, user_id))',
    );
    await db.run(
        'CREATE TABLE IF NOT EXISTS todo_item_categories (id integer primary key, todoId varchar(36) references todo_items, categoryId integer references categories)',
    );

    const todoItemsColumns = await db.all<{ name: string }[]>(
        'PRAGMA table_info(todo_items)',
    );
    const hasUserIdColumn = todoItemsColumns.some((column) => column.name === 'user_id');
    if (!hasUserIdColumn) {
        await db.run('ALTER TABLE todo_items ADD COLUMN user_id varchar(255) references users');
    }

    const categoryColumns = await db.all<{ name: string }[]>(
        'PRAGMA table_info(categories)',
    );
    const hasCategoryUserIdColumn = categoryColumns.some(
        (column) => column.name === 'user_id',
    );

    if (!hasCategoryUserIdColumn) {
        await db.exec('BEGIN TRANSACTION');
        try {
            await db.run(
                'CREATE TABLE categories_new (id integer primary key, name varchar(255), user_id varchar(255) references users, UNIQUE(name, user_id))',
            );
            await db.run(
                'CREATE TABLE todo_item_categories_new (id integer primary key, todoId varchar(36) references todo_items, categoryId integer references categories_new)',
            );

            await db.run(
                `INSERT INTO categories_new (name, user_id)
                 SELECT DISTINCT c.name, ti.user_id
                 FROM categories c
                 JOIN todo_item_categories tic ON tic.categoryId = c.id
                 JOIN todo_items ti ON ti.id = tic.todoId
                 WHERE ti.user_id IS NOT NULL`,
            );

            await db.run(
                `INSERT INTO todo_item_categories_new (todoId, categoryId)
                 SELECT tic.todoId, cn.id
                 FROM todo_item_categories tic
                 JOIN categories c ON c.id = tic.categoryId
                 JOIN todo_items ti ON ti.id = tic.todoId
                 JOIN categories_new cn ON cn.name = c.name AND cn.user_id = ti.user_id`,
            );

            await db.run('DROP TABLE todo_item_categories');
            await db.run('DROP TABLE categories');
            await db.run('ALTER TABLE categories_new RENAME TO categories');
            await db.run('ALTER TABLE todo_item_categories_new RENAME TO todo_item_categories');
            await db.exec('COMMIT');
        } catch (err) {
            await db.exec('ROLLBACK');
            throw err;
        }
    }
}

async function teardown(): Promise<void> {
    await db.close();
}

async function getOrCreateUser(profile: { id: string; email: string; name: string }) {
    let user = await db.get('SELECT * FROM users WHERE id = ?', [profile.id]);
    if (!user) {
        await db.run('INSERT INTO users (id, email, name) VALUES (?, ?, ?)', [profile.id, profile.email, profile.name]);
        user = await db.get('SELECT * FROM users WHERE id = ?', [profile.id]);
    }
    return user;
}

async function getUserById(id: string) {
    return await db.get('SELECT * FROM users WHERE id = ?', [id]);
}

async function getCategories(userId: string) {
    const rows = await db.all('SELECT id, name FROM categories WHERE user_id = ?', [userId]);
    return rows.map((item) => ({
        ...item,
    }));
}

async function addCategory(name: Category['name'], userId: string): Promise<number> {
    const result = await db.get(
        'INSERT INTO categories (name, user_id) VALUES (?, ?) RETURNING id',
        [name, userId],
    );
    return result.id;
}

async function addItemToCategory(
    itemId: Todo['id'],
    categoryId: Category['id'],
    userId: string,
) {
    const result = await db.run(
        `INSERT INTO todo_item_categories (todoId, categoryId)
         SELECT ti.id, c.id
         FROM todo_items ti
         JOIN categories c ON c.id = ?
         WHERE ti.id = ? AND ti.user_id = ? AND c.user_id = ?`,
        [categoryId, itemId, userId, userId],
    );
    if (result.changes === 0) {
        throw new Error('Category or item not found for current user');
    }
    return await getItem(itemId, userId);
}

async function removeItemFromCategory(
    itemId: Todo['id'],
    categoryId: Category['id'],
    userId: string,
) {
    await db.run(
        `DELETE FROM todo_item_categories
         WHERE todoId = ? AND categoryId = ?
           AND EXISTS (SELECT 1 FROM todo_items ti WHERE ti.id = ? AND ti.user_id = ?)
           AND EXISTS (SELECT 1 FROM categories c WHERE c.id = ? AND c.user_id = ?)`,
        [itemId, categoryId, itemId, userId, categoryId, userId],
    );
    return await getItem(itemId, userId);
}

async function getItems(userId: string, filters?: {
    search?: string;
    priority?: Priority;
    categories?: number[];
}) {
    let query = `SELECT 
            todo_items.id as todoId, 
            todo_items.name as todoName, 
            completed, 
            priority, 
            utcDueDate, 
            categories.id as categoryId, 
            categories.name as categoryName 
        FROM todo_items LEFT JOIN todo_item_categories ON todo_items.id = todo_item_categories.todoId 
        LEFT JOIN categories ON todo_item_categories.categoryId = categories.id`;

    const conditions: string[] = [];
    const params: any[] = [];

    conditions.push('todo_items.user_id = ?');
    params.push(userId);

    if (filters) {
        if (filters.search) {
            conditions.push('todo_items.name LIKE ?');
            params.push(`%${filters.search}%`);
        }
        if (filters.priority !== undefined) {
            conditions.push('todo_items.priority = ?');
            params.push(filters.priority);
        }
        if (filters.categories && filters.categories.length > 0) {
            conditions.push(`todo_items.id IN (
                SELECT todoId FROM todo_item_categories WHERE categoryId IN (${filters.categories
                    .map(() => '?')
                    .join(',')})
            )`);
            params.push(...filters.categories);
        }
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const rows = await db.all(query, params);
    const result = rows.reduce<Record<string, Todo>>((acc, curr) => {
        if (!acc[curr.todoId]) {
            acc[curr.todoId] = {
                categories: curr.categoryId
                    ? [{ id: curr.categoryId, name: curr.categoryName }]
                    : [],
                completed: curr.completed === 1,
                id: curr.todoId,
                name: curr.todoName,
                priority: curr.priority,
                utcDueDate:
                    curr.utcDueDate === null ? undefined : curr.utcDueDate,
            };
        } else {
            const category = { id: curr.categoryId, name: curr.categoryName };
            acc[curr.todoId]?.categories.push(category);
        }

        return acc;
    }, {});

    return Object.values(result);
}

async function getItem(id: Todo['id'], userId: string) {
    // TODO: don't duplicate this
    const rows = await db.all(
        `SELECT 
            todo_items.id as todoId, 
            todo_items.name as todoName, 
            completed, 
            priority, 
            utcDueDate, 
            categories.id as categoryId, 
            categories.name as categoryName 
        FROM todo_items LEFT JOIN todo_item_categories ON todo_items.id = todo_item_categories.todoId 
        LEFT JOIN categories ON todo_item_categories.categoryId = categories.id
        WHERE todo_items.id=? AND todo_items.user_id=?`,
        [id, userId],
    );

    const result = rows.reduce<Record<string, Todo>>((acc, curr) => {
        if (!acc[curr.todoId]) {
            acc[curr.todoId] = {
                categories: curr.categoryId
                    ? [{ id: curr.categoryId, name: curr.categoryName }]
                    : [],
                completed: curr.completed === 1,
                id: curr.todoId,
                name: curr.todoName,
                priority: curr.priority,
                utcDueDate:
                    curr.utcDueDate === null ? undefined : curr.utcDueDate,
            };
        } else {
            const category = { id: curr.categoryId, name: curr.categoryName };
            acc[curr.todoId]?.categories.push(category);
        }

        return acc;
    }, {});

    return result[id];
}

async function storeItem(item: Todo, userId: string): Promise<void> {
    await db.run(
        'INSERT INTO todo_items (id, name, completed, priority, utcDueDate, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [
            item.id,
            item.name,
            item.completed ? 1 : 0,
            item.priority,
            item.utcDueDate,
            userId,
        ],
    );
}

async function updateItem(id: Todo['id'], item: Todo, userId: string): Promise<void> {
    await db.run(
        'UPDATE todo_items SET name=?, completed=?, priority=?, utcDueDate=? WHERE id = ? AND user_id = ?',
        [item.name, item.completed ? 1 : 0, item.priority, item.utcDueDate, id, userId],
    );
}

async function removeItem(id: Todo['id'], userId: string): Promise<void> {
    await db.run('DELETE FROM todo_item_categories WHERE todoId = ?', [id]);
    await db.run('DELETE FROM todo_items WHERE id = ? AND user_id = ?', [id, userId]);
}

async function updateItemPriority(id: Todo['id'], priority: Priority, userId: string) {
    await db.run('UPDATE todo_items SET priority=? WHERE id = ? AND user_id = ?', [
        priority,
        id,
        userId,
    ]);
    return await getItem(id, userId);
}

export default {
    init,
    teardown,
    getOrCreateUser,
    getUserById,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
    getCategories,
    addCategory,
    addItemToCategory,
    removeItemFromCategory,
    updateItemPriority,
};
