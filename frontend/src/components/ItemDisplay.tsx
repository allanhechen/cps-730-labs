import { Priority, type Category, type Todo } from '@todo-app/shared';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import api from '../api';
import { type ChangeEvent, useState, useEffect } from 'react';
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
  const [approaching, setApproaching] = useState(false);

  useEffect(() => {
    const checkApproaching = () => {
      const utcDueDate = item.utcDueDate;
      if (!utcDueDate) {
        setApproaching(false);
        return;
      }
      const now = new Date();
      const due = new Date(utcDueDate);
      const diff = due.getTime() - now.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      setApproaching(diff < oneDay);
    };

    checkApproaching();
    const interval = setInterval(checkApproaching, 60000);
    return () => clearInterval(interval);
  }, [item]);

  const toggleCompletion = async () => {
    const updatedItem: Todo = {
      ...item,
      completed: !item.completed,
    };
    const response = await api.updateTodo(item.id, updatedItem);
    onItemUpdate(response);
  };

  const handlePriorityChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const updatedItem: Todo = {
      ...item,
      priority: parseInt(e.target.value),
    };
    const response = await api.updateTodo(item.id, updatedItem);
    onItemUpdate(response);
  };

  const handleDueDateChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    const utcDueDate = dateStr ? `${dateStr}T00:00:00.000Z` : undefined;
    const updatedItem: Todo = {
      ...item,
      utcDueDate,
    };
    const response = await api.updateTodo(item.id, updatedItem);
    onItemUpdate(response);
  };

  const addCategory = async (e: ChangeEvent<HTMLSelectElement>) => {
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

  const getLocalDateValue = (utcDate: string | undefined) => {
    if (!utcDate) return '';
    return utcDate.split('T')[0];
  };

  const showApproachingHighlight = approaching && !item.completed;

  return (
    <Container
      fluid
      className={`item ${item.completed && 'completed'} ${
        showApproachingHighlight ? 'bg-danger text-white' : ''
      }`}
      style={{ padding: '10px', borderRadius: '4px', marginBottom: '8px' }}
    >
      <Row className="align-items-center">
        <Col xs={1} className="text-center">
          <Button
            className="toggles"
            size="sm"
            variant="link"
            onClick={toggleCompletion}
            style={{ color: showApproachingHighlight ? 'white' : 'inherit' }}
            aria-label={
              item.completed
                ? 'Mark item as incomplete'
                : 'Mark item as complete'
            }
          >
            <FontAwesomeIcon icon={item.completed ? faCheckSquare : faSquare} />
          </Button>
        </Col>
        <Col xs={3} className="name">
          {item.name}
        </Col>
        <Col xs={3}>
          <Form.Control
            type="date"
            value={getLocalDateValue(item.utcDueDate)}
            onChange={handleDueDateChange}
            size="sm"
          />
        </Col>
        <Col xs={4}>
          <Form.Select
            value={item.priority}
            onChange={handlePriorityChange}
            size="sm"
            aria-label="Priority"
          >
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
            <FontAwesomeIcon
              icon={faTrash}
              className={
                showApproachingHighlight ? 'text-white' : 'text-danger'
              }
            />
          </Button>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col xs={7} className="d-flex flex-wrap gap-1">
          {item.categories.map(({ id, name }) => (
            <div className="d-flex" key={id}>
              <Button
                size="sm"
                variant={showApproachingHighlight ? 'light' : 'primary'}
                onClick={() => removeCategory(id)}
                aria-label="Remove Category"
              >
                {name}
              </Button>
            </div>
          ))}
        </Col>
        <Col xs={4}>
          <Form.Select onChange={addCategory} size="sm">
            <option>Add category...</option>
            {categories.map(({ id, name }) => {
              if (
                item.categories.some(
                  ({ name: existingCategory }) => existingCategory === name,
                )
              ) {
                return null;
              }
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col xs={1}></Col>
      </Row>
    </Container>
  );
}

export default ItemDisplay;
