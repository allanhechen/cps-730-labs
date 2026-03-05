import db from '../../src/persistence';
import getCategories from '../../src/routes/getCategories';

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        getCategories: jest.fn(),
    },
}));

test('it gets categories correctly', async () => {
    const categories = [
        { id: 1, name: 'Work' },
        { id: 2, name: 'Personal' },
    ];

    const req = {} as any;
    const res = { send: jest.fn() } as any;

    (db.getCategories as jest.Mock).mockResolvedValue(categories);

    await getCategories(req, res);

    expect(jest.mocked(db.getCategories).mock.calls.length).toBe(1);
    expect(jest.mocked(res.send).mock.calls.length).toBe(1);
    expect(jest.mocked(res.send).mock.calls[0][0]).toEqual(categories);
});
