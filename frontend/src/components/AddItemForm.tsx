import type { Todo } from '@todo-app/shared';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import api from '../api';

interface AddItemFormProps {
  onNewItem: (item: Todo) => void;
}

function AddItemForm({ onNewItem }: AddItemFormProps) {
  const [newItem, setNewItem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitNewItem = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const item = await api.createTodo(newItem);
    onNewItem(item);
    setSubmitting(false);
    setNewItem('');
  };

  return (
    <Form onSubmit={submitNewItem}>
      <InputGroup className="mb-3">
        <Form.Control
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          type="text"
          placeholder="New Item"
          aria-describedby="basic-addon1"
        />
        <InputGroup>
          <Button
            type="submit"
            variant="success"
            disabled={!newItem.length || submitting}
            className={submitting ? 'disabled' : ''}
          >
            {submitting ? 'Adding...' : 'Add Item'}
          </Button>
        </InputGroup>
      </InputGroup>
    </Form>
  );
}

export default AddItemForm;
