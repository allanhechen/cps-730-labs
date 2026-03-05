import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ItemDisplay from './ItemDisplay';
import { Priority } from '@todo-app/shared';

describe('ItemDisplay component', () => {
  const mockItem = {
    id: '1',
    name: 'Test Todo',
    completed: false,
    priority: Priority.MEDIUM,
    categories: [{ id: 1, name: 'Work' }],
    utcDueDate: undefined,
  };

  const mockCategories = [{ id: 1, name: 'Work' }, { id: 2, name: 'Personal' }];
  const onItemUpdate = vi.fn();
  const onItemRemoval = vi.fn();

  it('should render todo name', () => {
    render(
      <ItemDisplay
        item={mockItem}
        categories={mockCategories}
        onItemUpdate={onItemUpdate}
        onItemRemoval={onItemRemoval}
      />
    );
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should render selected priority', () => {
    render(
      <ItemDisplay
        item={mockItem}
        categories={mockCategories}
        onItemUpdate={onItemUpdate}
        onItemRemoval={onItemRemoval}
      />
    );
    const select = screen.getByRole('combobox', { name: /priority/i });
    expect(select).toHaveValue(Priority.MEDIUM.toString());
  });

  it('should render categories', () => {
    render(
      <ItemDisplay
        item={mockItem}
        categories={mockCategories}
        onItemUpdate={onItemUpdate}
        onItemRemoval={onItemRemoval}
      />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
  });
});
