import { Priority, type Category, type Todo } from '@todo-app/shared';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import api from '../api';
import type { ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons';

interface ItemDisplayProps {
  item: Todo;
  categories: Category[];
  onItemUpdate: (item: Todo) => void;
  onItemRemoval: (item: Todo) => void;
}

function ItemDisplay({
  item,
  categories,
  onItemUpdate,
  onItemRemoval,
}: ItemDisplayProps) {
  const toggleCompletion = async () => {
    const updatedItem: Todo = {
      ...item,
      completed: !item.completed,
    };
    const response = await api.updateTodo(item.id, updatedItem);
    onItemUpdate(response);
  };

  const handlePriorityChange = async (
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

  const addCategory = async (
    e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const categoryId = parseInt(e.target.value);
    const response = await api.addItemToCategory(item.id, categoryId);
    onItemUpdate(response);
  };

  const removeCategory = async (categoryId: Category['id']) => {
    const response = await api.removeItemFromCategory(item.id, categoryId);
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
            <FontAwesomeIcon icon={item.completed ? faCheckSquare : faSquare} />
          </Button>
        </Col>
        <Col xs={6} className="name">
          {item.name}
        </Col>
        <Col xs={4}>
          <Form.Select value={item.priority} onChange={handlePriorityChange}>
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
            <FontAwesomeIcon icon={faTrash} className="text-danger" />
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={7}>
          {...item.categories.map(({ id, name }) => (
            <div className="d-flex">
              <Button
                size="sm"
                onClick={() => removeCategory(id)}
                aria-label="Remove Item"
              >
                {name}
              </Button>
            </div>
          ))}
        </Col>
        <Col xs={4}>
          <Form.Select onChange={addCategory}>
            <option>Add category...</option>
            {...categories.map(({ id, name }) => {
              if (
                item.categories.some(
                  ({ name: existingCategory }) => existingCategory === name,
                )
              ) {
                return null;
              }
              return <option value={id}>{name}</option>;
            })}
          </Form.Select>
        </Col>
        <Col xs={1}></Col>
      </Row>
    </Container>
  );
}

export default ItemDisplay;
