import { Fragment, useCallback, useEffect, useState } from 'react';
import ItemDisplay from './ItemDisplay';
import AddItemForm from './AddItemForm';
import type { Category, Todo } from '@todo-app/shared';
import api from '../api';
import AddCategoryForm from './AddCategoryForm';

function TodoListCard() {
  const [items, setItems] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadData() {
      const items = await api.getTodos();
      setItems(items);

      const categories = await api.getCategories();
      setCategories(categories);
    }

    loadData();
  }, []);

  const onNewCategory = useCallback(
    (category: Category) => {
      setCategories([...categories, category]);
    },
    [categories],
  );

  const onNewItem = useCallback(
    (newItem: Todo) => {
      setItems([...items, newItem]);
    },
    [items],
  );

  const onItemUpdate = useCallback(
    (item: Todo) => {
      const index = items.findIndex((i) => i.id === item.id);
      setItems([...items.slice(0, index), item, ...items.slice(index + 1)]);
    },
    [items],
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
      {items.length === 0 && (
        <p className="text-center">No items yet! Add one above!</p>
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
