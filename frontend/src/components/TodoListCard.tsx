import { Fragment, useCallback, useEffect, useState } from 'react';
import ItemDisplay from './ItemDisplay';
import AddItemForm from './AddItemForm';
import type { Category, Todo } from '@todo-app/shared';
import api from '../api';
import AddCategoryForm from './AddCategoryForm';
import FilterForm, { type Filters } from './FilterForm';

function TodoListCard() {
  const [items, setItems] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filters>({ name: '' });

  const loadItems = useCallback(async (currentFilters: Filters) => {
    const items = await api.getTodos(currentFilters);
    setItems(items);
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      const categories = await api.getCategories();
      setCategories(categories);
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      await loadItems(filters);
    }
    fetchData();
  }, [filters, loadItems]);

  const onNewCategory = useCallback(
    (category: Category) => {
      setCategories([...categories, category]);
    },
    [categories],
  );

  const onNewItem = useCallback(
    () => {
      loadItems(filters);
    },
    [filters, loadItems],
  );

  const onItemUpdate = useCallback(
    () => {
      loadItems(filters);
    },
    [filters, loadItems],
  );

  const onItemRemoval = useCallback(
    (item: Todo) => {
      const index = items.findIndex((i) => i.id === item.id);
      setItems([...items.slice(0, index), ...items.slice(index + 1)]);
    },
    [items],
  );

  if (items === null) return 'Loading...';

  return (
    <Fragment>
      <AddCategoryForm onNewCategory={onNewCategory} />
      <AddItemForm onNewItem={onNewItem} />
      <hr />
      <FilterForm categories={categories} onFilterChange={setFilters} />
      {items.length === 0 && (
        <p className="text-center">No items match your criteria!</p>
      )}
      {items.map((item) => (
        <ItemDisplay
          item={item}
          categories={categories}
          key={item.id}
          onItemUpdate={onItemUpdate}
          onItemRemoval={onItemRemoval}
        />
      ))}
    </Fragment>
  );
}

export default TodoListCard;
