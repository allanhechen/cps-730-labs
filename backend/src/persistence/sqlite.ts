// TODO: use dynamic import or bootstrap
import dotenv from 'dotenv';
dotenv.config();

import sqlite3 from 'sqlite3';
sqlite3.verbose();
import { open, type Database } from 'sqlite';
import fs from 'fs';
const location = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';
import path from 'path';
import type { Todo } from '@todo-app/shared';

let db: Database;

async function init(): Promise<any> {
    const dirName = path.dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    db = await open({
        filename: '/tmp/database.db',
        driver: sqlite3.Database,
    });

    await db.run(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, priority integer, utcDueDate text)',
    );
}

async function teardown(): Promise<void> {
    await db.close();
}

async function getItems() {
    const rows = await db.all('SELECT * FROM todo_items');
    return rows.map((item) =>
        Object.assign({}, item, {
            completed: (item.completed as any) === 1,
        }),
    );
}

async function getItem(id: Todo['id']) {
    const rows = await db.all('SELECT * FROM todo_items WHERE id=?', [id]);

    return rows.map((item) =>
        Object.assign({}, item, {
            completed: (item.completed as any) === 1,
        }),
    )[0];
}

async function storeItem(item: Todo): Promise<void> {
    await db.run(
        'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
        [item.id, item.name, item.completed ? 1 : 0],
    );
}

async function updateItem(id: Todo['id'], item: Todo): Promise<void> {
    await db.run('UPDATE todo_items SET name=?, completed=? WHERE id = ?', [
        item.name,
        item.completed ? 1 : 0,
        id,
    ]);
}

async function removeItem(id: Todo['id']): Promise<void> {
    await db.run('DELETE FROM todo_items WHERE id = ?', [id]);
}

export default {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};
