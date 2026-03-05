import type { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../../src/persistence';
import addItem from '../../src/routes/addItem';

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        removeItem: jest.fn(),
        storeItem: jest.fn(),
        getItem: jest.fn(),
    },
}));

test('it stores item correctly', async () => {
    const id = 'something-not-a-uuid';
    const name = 'A sample item';

    const req = { body: { name } } as any;
    const res = { send: jest.fn() } as any;

    (uuid as jest.Mock).mockReturnValue(id);

    await addItem(req, res);

    const expectedItem = { id, name, completed: false };

    expect(jest.mocked(db.storeItem).mock.calls.length).toBe(1);
    expect(jest.mocked(db.storeItem).mock.calls[0]![0]).toEqual(expectedItem);

    expect(jest.mocked(res.send).mock.calls.length).toBe(1);
    expect(jest.mocked(res.send).mock.calls[0][0]).toEqual(expectedItem);
});
