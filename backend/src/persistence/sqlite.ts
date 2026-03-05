// TODO: use dynamic import or bootstrap
import dotenv from 'dotenv';
dotenv.config();

import sqlite3 from 'sqlite3';
sqlite3.verbose();
import { open, type Database } from 'sqlite';
import fs from 'fs';
const location = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';
import path from 'path';
import type { Category, Todo } from '@todo-app/shared';
import { Priority } from '@todo-app/shared';

let db: Database;

async function init(): Promise<void> {
    const dirName = path.dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    db = await open({
        filename: location,
        driver: sqlite3.Database,
    });

    await db.run(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, priority integer, utcDueDate text)',
    );
    await db.run(
        'CREATE TABLE IF NOT EXISTS categories (id integer primary key, name varchar(255) UNIQUE)',
    );
    await db.run(
        'CREATE TABLE IF NOT EXISTS todo_item_categories (id integer primary key, todoId varchar(36) references todo_items, categoryId integer references categories)',
    );
}

async function teardown(): Promise<void> {
    await db.close();
}

async function getCategories() {
    const rows = await db.all('SELECT * FROM categories');
    return rows.map((item) => ({
        ...item,
    }));
}

async function addCategory(name: Category['name']): Promise<number> {
    const result = await db.get(
        'INSERT INTO categories (name) VALUES (?) RETURNING id',
        [name],
    );
    return result.id;
}

async function addItemToCategory(
    itemId: Todo['id'],
    categoryId: Category['id'],
) {
    db.run(
        'INSERT INTO todo_item_categories (todoId, categoryId) VALUES (?, ?)',
        [itemId, categoryId],
    );
}

async function removeItemFromCategory(
    itemId: Todo['id'],
    categoryId: Category['id'],
) {
    db.run('DELETE FROM todo_item_categories WHERE todoId=? AND categoryId=?', [
        itemId,
        categoryId,
    ]);
}

async function getItems() {
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
        LEFT JOIN categories ON todo_item_categories.categoryId = categories.id;`,
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

    return Object.values(result);
}

async function getItem(id: Todo['id']) {
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
        WHERE todo_items.id=?`,
        [id],
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

async function storeItem(item: Todo): Promise<void> {
    await db.run(
        'INSERT INTO todo_items (id, name, completed, priority, utcDueDate) VALUES (?, ?, ?, ?, ?)',
        [
            item.id,
            item.name,
            item.completed ? 1 : 0,
            item.priority,
            item.utcDueDate,
        ],
    );
}

async function updateItem(id: Todo['id'], item: Todo): Promise<void> {
    await db.run(
        'UPDATE todo_items SET name=?, completed=?, priority=?, utcDueDate=? WHERE id = ?',
        [item.name, item.completed ? 1 : 0, item.priority, item.utcDueDate, id],
    );
}

async function removeItem(id: Todo['id']): Promise<void> {
    await db.run('DELETE FROM todo_item_categories WHERE todoId = ?', [id]);
    await db.run('DELETE FROM todo_items WHERE id = ?', [id]);
}

async function getPriorities() {
    return Object.entries(Priority)
        .filter(([key]) => isNaN(Number(key)))
        .map(([name, id]) => ({
            id: id as number,
            name,
        }));
}

async function updateItemPriority(
    id: Todo['id'],
    priority: Priority,
): Promise<void> {
    await db.run('UPDATE todo_items SET priority=? WHERE id = ?', [
        priority,
        id,
    ]);
}

export default {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
    getCategories,
    addCategory,
    addItemToCategory,
    removeItemFromCategory,
    getPriorities,
    updateItemPriority,
};
