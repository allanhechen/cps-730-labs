import db from '../../src/persistence';
import addCategory from '../../src/routes/addCategory';

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        addCategory: jest.fn(),
    },
}));

test('it adds category correctly', async () => {
    const name = 'New Category';
    const id = 1;

    const req = { body: { name } } as any;
    const res = { send: jest.fn() } as any;

    (db.addCategory as jest.Mock).mockResolvedValue(id);

    await addCategory(req, res);

    expect(jest.mocked(db.addCategory).mock.calls.length).toBe(1);
    expect(jest.mocked(db.addCategory).mock.calls[0]![0]).toBe(name);

    expect(jest.mocked(res.send).mock.calls.length).toBe(1);
    expect(jest.mocked(res.send).mock.calls[0][0]).toEqual({
        id,
        name,
    });
});
