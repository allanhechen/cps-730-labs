import db from '../../src/persistence';
import getPriorities from '../../src/routes/getPriorities';
import { Priority } from '@todo-app/shared';

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        getPriorities: jest.fn(),
    },
}));

test('it gets priorities correctly', async () => {
    const priorities = [
        { id: 0, name: 'NONE' },
        { id: 3, name: 'LOW' },
        { id: 5, name: 'MEDIUM' },
        { id: 7, name: 'HIGH' },
    ];

    const req = {} as any;
    const res = { send: jest.fn() } as any;

    (db.getPriorities as jest.Mock).mockResolvedValue(priorities);

    await getPriorities(req, res);

    expect(jest.mocked(db.getPriorities).mock.calls.length).toBe(1);
    expect(jest.mocked(res.send).mock.calls.length).toBe(1);
    expect(jest.mocked(res.send).mock.calls[0][0]).toEqual(priorities);
});
