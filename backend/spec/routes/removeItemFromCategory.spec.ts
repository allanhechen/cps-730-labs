import db from '../../src/persistence';
import removeItemFromCategory from '../../src/routes/removeItemFromCategory';

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        removeItemFromCategory: jest.fn(),
    },
}));

test('it removes item from category correctly', async () => {
    const itemId = 'item-123';
    const categoryId = 1;

    const req = {
        params: { itemId },
        body: { categoryId },
    } as any;
    const res = { send: jest.fn() } as any;

    await removeItemFromCategory(req, res);

    expect(jest.mocked(db.removeItemFromCategory).mock.calls.length).toBe(1);
    expect(jest.mocked(db.removeItemFromCategory).mock.calls[0]).toEqual([
        itemId,
        categoryId,
    ]);

    expect(jest.mocked(res.send).mock.calls.length).toBe(1);
});
