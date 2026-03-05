import db from '../../src/persistence';
import updateItem from '../../src/routes/updateItem';

const ITEM = { id: 12345 };

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(),
        updateItem: jest.fn(),
    },
}));

test('it updates items correctly', async () => {
    const req = {
        params: { id: '1234' },
        body: { name: 'New title', completed: false },
    } as any;
    const res = { send: jest.fn() } as any;

    jest.mocked(db.getItem).mockResolvedValue(ITEM);

    await updateItem(req, res);

    expect(db.updateItem).toHaveBeenCalledTimes(1);
    expect(db.updateItem).toHaveBeenCalledWith(req.params.id, {
        name: 'New title',
        completed: false,
    });

    expect(db.getItem).toHaveBeenCalledTimes(1);
    expect(db.getItem).toHaveBeenCalledWith(req.params.id);

    expect(res.send).toHaveBeenCalledWith(ITEM);
});
