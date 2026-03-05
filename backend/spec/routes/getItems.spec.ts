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
    const req = {} as any;
    const res = { send: jest.fn() } as any;

    jest.mocked(db.getItems).mockResolvedValue(ITEMS);

    await getItems(req, res);

    expect(db.getItems).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(ITEMS);
});
