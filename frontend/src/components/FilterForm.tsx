import { Priority, type Category } from '@todo-app/shared';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

export interface Filters {
  name: string;
  categoryId?: number;
  priority?: number;
}

interface FilterFormProps {
  categories: Category[];
  onFilterChange: (filters: Filters) => void;
}

function FilterForm({ categories, onFilterChange }: FilterFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState<number | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        name,
        categoryId,
        priority,
      });
    }, 300); // Debounce for name search

    return () => clearTimeout(timer);
  }, [name, categoryId, priority, onFilterChange]);

  const handleClear = () => {
    setName('');
    setCategoryId(undefined);
    setPriority(undefined);
  };

  return (
    <Form className="mb-4 p-3 border rounded bg-light">
      <Row className="align-items-end">
        <Col md={4}>
          <Form.Group controlId="filterName">
            <Form.Label>Search Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="filterCategory">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={categoryId ?? ''}
              onChange={(e) =>
                setCategoryId(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="filterPriority">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              value={priority ?? ''}
              onChange={(e) =>
                setPriority(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
            >
              <option value="">All Priorities</option>
              <option value={Priority.NONE}>None</option>
              <option value={Priority.LOW}>Low</option>
              <option value={Priority.MEDIUM}>Medium</option>
              <option value={Priority.HIGH}>High</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClear}
            className="w-100"
          >
            Clear
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default FilterForm;
