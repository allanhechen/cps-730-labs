import fs from 'fs';
import db from '../../src/persistence/sqlite';
import { Priority, type Todo } from '@todo-app/shared';

const location = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';

const ITEM: Todo = {
    id: '7aef3d7c-d301-4846-8358-2a91ec9d6be3',
    name: 'Test',
    completed: false,
    categories: [],
    priority: Priority.NONE,
    utcDueDate: undefined,
};

beforeEach(() => {
    if (fs.existsSync(location)) {
        fs.unlinkSync(location);
    }
});

describe('todo items', () => {
    test('it initializes correctly', async () => {
        await db.init();
    });

    test('it can store and retrieve items', async () => {
        await db.init();

        await db.storeItem(ITEM);

        const items = await db.getItems();
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(ITEM);
    });

    test('it can update an existing item', async () => {
        await db.init();

        const initialItems = await db.getItems();
        expect(initialItems.length).toBe(0);

        await db.storeItem(ITEM);

        await db.updateItem(ITEM.id, { ...ITEM, completed: !ITEM.completed });

        const items = await db.getItems();
        expect(items.length).toBe(1);
        expect(items[0]!.completed).toBe(!ITEM.completed);
    });

    test('it can remove an existing item', async () => {
        await db.init();
        await db.storeItem(ITEM);

        await db.removeItem(ITEM.id);

        const items = await db.getItems();
        expect(items.length).toBe(0);
    });

    test('it can get a single item', async () => {
        await db.init();
        await db.storeItem(ITEM);

        const item = await db.getItem(ITEM.id);
        expect(item).toEqual(ITEM);
    });
});

describe('categories', () => {
    it('should be able to create categories and list them', async () => {
        await db.init();
        await db.addCategory('my category');
        await db.addCategory('my second category');
        const categories = await db.getCategories();

        expect(categories.length).toBe(2);
        expect(categories).toEqual([
            { id: 1, name: 'my category' },
            { id: 2, name: 'my second category' },
        ]);
    });

    it('should be able to add items to categories', async () => {
        await db.init();
        await db.storeItem(ITEM);
        await db.addCategory('my category');
        await db.addCategory('my second category');

        await db.addItemToCategory(ITEM.id, 1);
        await db.addItemToCategory(ITEM.id, 2);
        const items = await db.getItems();

        expect(items.length).toBe(1);
        expect(items[0]).toEqual({
            ...ITEM,
            categories: [
                { id: 1, name: 'my category' },
                { id: 2, name: 'my second category' },
            ],
        });
    });

    it('should be able to delete items with categories', async () => {
        await db.init();
        await db.storeItem(ITEM);
        await db.addCategory('my category');
        await db.addCategory('my second category');

        await db.addItemToCategory(ITEM.id, 1);
        await db.addItemToCategory(ITEM.id, 2);
        await db.removeItem(ITEM.id);
    });
});

describe('priorities', () => {
    it('should be able to get priorities', async () => {
        await db.init();
        const priorities = await db.getPriorities();
        expect(priorities).toEqual([
            { id: 0, name: 'NONE' },
            { id: 3, name: 'LOW' },
            { id: 5, name: 'MEDIUM' },
            { id: 7, name: 'HIGH' },
        ]);
    });

    it('should be able to update item priority', async () => {
        await db.init();
        await db.storeItem(ITEM);

        await db.updateItemPriority(ITEM.id, Priority.HIGH);

        const items = await db.getItems();
        expect(items.length).toBe(1);
        expect(items[0]!.priority).toBe(Priority.HIGH);
    });
});
