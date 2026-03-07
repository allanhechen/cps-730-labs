import fs from 'fs';
import db from '../../src/persistence/sqlite';
import { Priority, type Todo } from '@todo-app/shared';

const location = './test.db';

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

afterEach(() => {
    if (fs.existsSync(location)) {
        fs.unlinkSync(location);
    }
});

describe('todo items', () => {
    test('it initializes correctly', async () => {
        await db.init(location);
    });

    test('it can store and retrieve items', async () => {
        await db.init(location);

        await db.storeItem(ITEM);

        const items = await db.getItems();
        expect(items.length).toBe(1);
        expect(items[0]).toEqual(ITEM);
    });

    test('it can update an existing item', async () => {
        await db.init(location);

        const initialItems = await db.getItems();
        expect(initialItems.length).toBe(0);

        await db.storeItem(ITEM);

        await db.updateItem(ITEM.id, { ...ITEM, completed: !ITEM.completed });

        const items = await db.getItems();
        expect(items.length).toBe(1);
        expect(items[0]!.completed).toBe(!ITEM.completed);
    });

    test('it can remove an existing item', async () => {
        await db.init(location);
        await db.storeItem(ITEM);

        await db.removeItem(ITEM.id);

        const items = await db.getItems();
        expect(items.length).toBe(0);
    });

    test('it can get a single item', async () => {
        await db.init(location);
        await db.storeItem(ITEM);

        const item = await db.getItem(ITEM.id);
        expect(item).toEqual(ITEM);
    });

    test('it can filter by search', async () => {
        await db.init(location);
        await db.storeItem(ITEM);
        await db.storeItem({ ...ITEM, id: '2', name: 'Another' });

        const items = await db.getItems({ search: 'Test' });
        expect(items.length).toBe(1);
        expect(items[0]!.name).toBe('Test');

        const items2 = await db.getItems({ search: 'other' });
        expect(items2.length).toBe(1);
        expect(items2[0]!.name).toBe('Another');
    });

    test('it can filter by priority', async () => {
        await db.init(location);
        await db.storeItem(ITEM); // Priority.NONE (0)
        await db.storeItem({
            ...ITEM,
            id: '2',
            name: 'High',
            priority: Priority.HIGH,
        });

        const items = await db.getItems({ priority: Priority.HIGH });
        expect(items.length).toBe(1);
        expect(items[0]!.priority).toBe(Priority.HIGH);

        const items2 = await db.getItems({ priority: Priority.NONE });
        expect(items2.length).toBe(1);
        expect(items2[0]!.priority).toBe(Priority.NONE);
    });

    test('it can filter by categories', async () => {
        await db.init(location);
        await db.storeItem(ITEM); // id: 7aef3d7c-d301-4846-8358-2a91ec9d6be3
        await db.storeItem({ ...ITEM, id: '2', name: 'Item 2' });

        await db.addCategory('cat1'); // id: 1
        await db.addCategory('cat2'); // id: 2

        await db.addItemToCategory(ITEM.id, 1);
        await db.addItemToCategory('2', 2);

        const items = await db.getItems({ categories: [1] });
        expect(items.length).toBe(1);
        expect(items[0]!.id).toBe(ITEM.id);

        const items2 = await db.getItems({ categories: [2] });
        expect(items2.length).toBe(1);
        expect(items2[0]!.id).toBe('2');

        const items3 = await db.getItems({ categories: [1, 2] });
        expect(items3.length).toBe(2);
    });

    test('it returns all categories for filtered items', async () => {
        await db.init(location);
        await db.storeItem(ITEM);
        await db.addCategory('cat1'); // 1
        await db.addCategory('cat2'); // 2
        await db.addItemToCategory(ITEM.id, 1);
        await db.addItemToCategory(ITEM.id, 2);

        const items = await db.getItems({ categories: [1] });
        expect(items.length).toBe(1);
        expect(items[0]!.categories.length).toBe(2);
        expect(items[0]!.categories.map((c) => c.name).sort()).toEqual([
            'cat1',
            'cat2',
        ]);
    });
});

describe('categories', () => {
    it('should be able to create categories and list them', async () => {
        await db.init(location);
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
        await db.init(location);
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
        await db.init(location);
        await db.storeItem(ITEM);
        await db.addCategory('my category');
        await db.addCategory('my second category');

        await db.addItemToCategory(ITEM.id, 1);
        await db.addItemToCategory(ITEM.id, 2);
        await db.removeItem(ITEM.id);
    });
});

describe('priorities', () => {
    it('should be able to update item priority', async () => {
        await db.init(location);
        await db.storeItem(ITEM);

        await db.updateItemPriority(ITEM.id, Priority.HIGH);

        const items = await db.getItems();
        expect(items.length).toBe(1);
        expect(items[0]!.priority).toBe(Priority.HIGH);
    });
});
