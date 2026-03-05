import type { Request, Response } from 'express';
import db from '../../src/persistence';
import getItems from '../../src/routes/getItems';

const ITEMS = [{ id: 12345 }];

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        getItems: jest.fn(),
    },
}));

test('it gets items correctly', async () => {
    const req = { query: {} } as any;
    const res = { send: jest.fn() } as any;

    jest.mocked(db.getItems).mockResolvedValue(ITEMS);

    await getItems(req, res);

    expect(db.getItems).toHaveBeenCalledWith({});
    expect(res.send).toHaveBeenCalledWith(ITEMS);
});

test('it passes filters correctly', async () => {
    const req = {
        query: {
            search: 'test',
            priority: '7',
            categories: ['1', '2'],
        },
    } as any;
    const res = { send: jest.fn() } as any;

    jest.mocked(db.getItems).mockResolvedValue(ITEMS);

    await getItems(req, res);

    expect(db.getItems).toHaveBeenCalledWith({
        search: 'test',
        priority: 7,
        categories: [1, 2],
    });
});

test('it handles single category', async () => {
    const req = {
        query: {
            categories: '1',
        },
    } as any;
    const res = { send: jest.fn() } as any;

    jest.mocked(db.getItems).mockResolvedValue(ITEMS);

    await getItems(req, res);

    expect(db.getItems).toHaveBeenCalledWith({
        categories: [1],
    });
});
