import db from '../../src/persistence';
import addItemToCategory from '../../src/routes/addItemToCategory';

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        addItemToCategory: jest.fn(),
    },
}));

test('it adds item to category correctly', async () => {
    const itemId = 'item-123';
    const categoryId = 1;

    const req = {
        params: { itemId },
        body: { categoryId },
    } as any;
    const res = { sendStatus: jest.fn() } as any;

    await addItemToCategory(req, res);

    expect(jest.mocked(db.addItemToCategory).mock.calls.length).toBe(1);
    expect(jest.mocked(db.addItemToCategory).mock.calls[0]).toEqual([
        itemId,
        categoryId,
    ]);

    expect(jest.mocked(res.sendStatus).mock.calls.length).toBe(1);
    expect(jest.mocked(res.sendStatus).mock.calls[0][0]).toBe(204);
});
