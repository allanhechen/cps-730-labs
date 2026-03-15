import TodoListCard from './components/TodoListCard';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import { useState, useEffect } from 'react';
import api from './api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const u = await api.getUser();
      setUser(u);
    } catch (err) {
      console.error('Failed to check user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'PLACEHOLDER_URL'}/auth/google`;
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Navbar bg="light" expand="lg" className="mb-3">
        <Navbar.Brand>Todo App</Navbar.Brand>
        <Nav className="ml-auto">
          {user ? (
            <>
              <Nav.Item className="mr-2">Welcome, {user.name}</Nav.Item>
              <Button variant="outline-primary" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleLogin}>Login with Google</Button>
          )}
        </Nav>
      </Navbar>
      {user && (
        <Row>
          <Col md={{ offset: 3, span: 6 }}>
            <TodoListCard />
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default App;
