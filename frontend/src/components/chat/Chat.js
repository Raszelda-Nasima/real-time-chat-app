import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import AuthService from '../../services/AuthService';

const Chat = () => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: currentUser?.token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
    });

    newSocket.on('previousMessages', (previousMessages) => {
      setMessages(previousMessages);
    });

    newSocket.on('chatMessage', (msg) => {
      setMessages(prevMessages => [...prevMessages, msg]);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('chatMessage', message);
      setMessage('');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  return (
    <Container fluid>
      <Row className="vh-100">
        <Col md={3} className="bg-light p-0 border-right">
          <div className="p-3 bg-primary text-white">
            <h3>Real-Time Chat</h3>
            <div className="d-flex justify-content-between align-items-center">
              <small>Logged in as {currentUser?.username}</small>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
          <div className="p-3">
            <div className="mb-2">
              <strong>Status:</strong> {connected ? 'Connected' : 'Disconnected'}
            </div>
            {/* Here you could add a list of users/channels */}
          </div>
        </Col>
        
        <Col md={9} className="d-flex flex-column p-0">
          <div className="flex-grow-1 p-3 overflow-auto">
            {messages.map((msg, index) => (
              <Card 
                key={index} 
                className={`mb-2 ${msg.user === currentUser?.username ? 'ms-auto' : ''}`} 
                style={{ maxWidth: '80%' }}
              >
                <Card.Body className="py-2 px-3">
                  <div className="small text-muted">{msg.user || 'Anonymous'}</div>
                  <div>{msg.text}</div>
                </Card.Body>
              </Card>
            ))}
          </div>
          
          <Form onSubmit={handleSubmit} className="p-3 border-top">
            <Form.Group as={Row} className="m-0">
              <Col>
                <Form.Control
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={!connected}
                />
              </Col>
              <Col xs="auto">
                <Button type="submit" disabled={!connected}>Send</Button>
              </Col>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;