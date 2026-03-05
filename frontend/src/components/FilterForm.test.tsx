import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterForm from './FilterForm';
import { Priority } from '@todo-app/shared';

describe('FilterForm component', () => {
  const mockCategories = [{ id: 1, name: 'Work' }, { id: 2, name: 'Personal' }];
  const onFilterChange = vi.fn();

  it('should render all filter inputs', () => {
    render(<FilterForm categories={mockCategories} onFilterChange={onFilterChange} />);
    
    expect(screen.getByLabelText(/Search Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
  });

  it('should render category options', () => {
    render(<FilterForm categories={mockCategories} onFilterChange={onFilterChange} />);
    
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('should call onFilterChange when name is changed (debounced)', async () => {
    const user = userEvent.setup();
    render(<FilterForm categories={mockCategories} onFilterChange={onFilterChange} />);
    
    const nameInput = screen.getByLabelText(/Search Name/i);
    await user.type(nameInput, 'test');

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
        name: 'test'
      }));
    }, { timeout: 1000 });
  });

  it('should call onFilterChange when category is changed', async () => {
    const user = userEvent.setup();
    render(<FilterForm categories={mockCategories} onFilterChange={onFilterChange} />);
    
    const categorySelect = screen.getByLabelText(/Category/i);
    await user.selectOptions(categorySelect, '1');

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
        categoryId: 1
      }));
    });
  });

  it('should call onFilterChange when priority is changed', async () => {
    const user = userEvent.setup();
    render(<FilterForm categories={mockCategories} onFilterChange={onFilterChange} />);
    
    const prioritySelect = screen.getByLabelText(/Priority/i);
    await user.selectOptions(prioritySelect, Priority.HIGH.toString());

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({
        priority: Priority.HIGH
      }));
    });
  });

  it('should clear filters when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterForm categories={mockCategories} onFilterChange={onFilterChange} />);
    
    const nameInput = screen.getByLabelText(/Search Name/i);
    await user.type(nameInput, 'test');
    
    const clearButton = screen.getByRole('button', { name: /Clear/i });
    await user.click(clearButton);

    expect(nameInput).toHaveValue('');
    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith({
        name: '',
        categoryId: undefined,
        priority: undefined
      });
    });
  });
});
