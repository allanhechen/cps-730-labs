import type { Request, Response } from 'express';
import db from '../../src/persistence';
import deleteItem from '../../src/routes/deleteItem';

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        removeItem: jest.fn(),
        getItem: jest.fn(),
    },
}));

test('it removes item correctly', async () => {
    const req = { params: { id: '12345' } } as Partial<Request> as Request;
    const res = { sendStatus: jest.fn() } as Partial<Response> as Response;

    await deleteItem(req, res);

    expect(jest.mocked(db.removeItem).mock.calls.length).toBe(1);
    expect(jest.mocked(db.removeItem).mock.calls[0]![0]).toBe(req.params.id);
    expect(jest.mocked(res.sendStatus).mock.calls[0]!.length).toBe(1);
    expect(jest.mocked(res.sendStatus).mock.calls[0]![0]).toBe(200);
});
