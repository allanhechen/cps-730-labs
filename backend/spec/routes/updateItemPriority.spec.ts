import db from '../../src/persistence';
import updateItemPriority from '../../src/routes/updateItemPriority';
import { Priority } from '@todo-app/shared';

jest.mock('../../src/persistence', () => ({
    __esModule: true,
    default: {
        updateItemPriority: jest.fn(),
    },
}));

test('it updates item priority correctly', async () => {
    const id = 'item-123';
    const priority = Priority.HIGH;

    const req = {
        params: { id },
        body: { priority },
    } as any;
    const res = { sendStatus: jest.fn() } as any;

    await updateItemPriority(req, res);

    expect(jest.mocked(db.updateItemPriority).mock.calls.length).toBe(1);
    expect(jest.mocked(db.updateItemPriority).mock.calls[0]).toEqual([
        id,
        priority,
    ]);

    expect(jest.mocked(res.sendStatus).mock.calls.length).toBe(1);
    expect(jest.mocked(res.sendStatus).mock.calls[0][0]).toBe(204);
});
