import { Priority, type Todo } from '@todo-app/shared';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import api from '../api';
import type { ChangeEvent } from 'react';

interface ItemDisplayProps {
  item: Todo;
  onItemUpdate: (item: Todo) => void;
  onItemRemoval: (item: Todo) => void;
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }: ItemDisplayProps) {
  const toggleCompletion = async () => {
    const updatedItem: Todo = {
      ...item,
      completed: !item.completed,
    };
    const response = await api.updateTodo(item.id, updatedItem);
    onItemUpdate(response);
  };

  const handleChange = async (
    e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const updatedItem: Todo = {
      ...item,
      priority: parseInt(e.target.value),
    };
    const response = await api.updateTodo(item.id, updatedItem);
    onItemUpdate(response);
  };

  const removeItem = async () => {
    await api.deleteTodo(item.id);
    onItemRemoval(item);
  };

  return (
    <Container fluid className={`item ${item.completed && 'completed'}`}>
      <Row>
        <Col xs={1} className="text-center">
          <Button
            className="toggles"
            size="sm"
            variant="link"
            onClick={toggleCompletion}
            aria-label={
              item.completed
                ? 'Mark item as incomplete'
                : 'Mark item as complete'
            }
          >
            <i
              className={`far ${
                item.completed ? 'fa-check-square' : 'fa-square'
              }`}
            />
          </Button>
        </Col>
        <Col xs={6} className="name">
          {item.name}
        </Col>
        <Col xs={4}>
          <Form.Select value={item.priority} onChange={handleChange}>
            <option value={Priority.NONE}>None</option>
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </Form.Select>
        </Col>
        <Col xs={1} className="text-center remove">
          <Button
            size="sm"
            variant="link"
            onClick={removeItem}
            aria-label="Remove Item"
          >
            <i className="fa fa-trash text-danger" />
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default ItemDisplay;
