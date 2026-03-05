import type { Category } from '@todo-app/shared';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import api from '../api';

interface AddCategoryFormProps {
  onNewCategory: (category: Category) => void;
}

function AddCategoryForm({ onNewCategory }: AddCategoryFormProps) {
  const [newCategory, setNewCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitNewCategory = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const category = await api.addCategory(newCategory);
    onNewCategory(category);
    setSubmitting(false);
    setNewCategory('');
  };

  return (
    <Form onSubmit={submitNewCategory}>
      <InputGroup className="mb-3">
        <Form.Control
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          type="text"
          placeholder="New Category"
          aria-describedby="basic-addon1"
        />
        <InputGroup>
          <Button
            type="submit"
            variant="success"
            disabled={!newCategory.length || submitting}
            className={submitting ? 'disabled' : ''}
          >
            {submitting ? 'Adding...' : 'Add Category'}
          </Button>
        </InputGroup>
      </InputGroup>
    </Form>
  );
}

export default AddCategoryForm;
