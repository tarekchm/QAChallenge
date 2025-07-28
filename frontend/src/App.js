import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendUrl = 'http://localhost:4001';

function App() {
  const [token, setToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  // Login handler
  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await axios.post(`${backendUrl}/login`, { username, password });
      setToken(res.data.token);
      loadTodos(res.data.token);
    } catch {
      setLoginError('Invalid username or password');
    }
  };

  // Load todos from backend
  const loadTodos = async (authToken) => {
    try {
      const res = await axios.get(`${backendUrl}/items`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTodos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const res = await axios.post(
        `${backendUrl}/items`,
        { text: newTodo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, res.data]);
      setNewTodo('');
    } catch (err) {
      console.error(err);
    }
  };

  // Start editing todo
  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditText(todo.text);
  };

  // Save edited todo
  const saveEdit = async () => {
    try {
      const res = await axios.put(
        `${backendUrl}/items/${editId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map(t => (t.id === editId ? res.data : t)));
      setEditId(null);
      setEditText('');
    } catch (err) {
      console.error(err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${backendUrl}/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
        <h2>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          data-testid="username-input"
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          data-testid="password-input"
        />
        <br />
        <button onClick={handleLogin} data-testid="login-btn">Login</button>
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>Todo List</h2>
      <input
        placeholder="New todo"
        value={newTodo}
        onChange={e => setNewTodo(e.target.value)}
        data-testid="new-todo-input"
      />
      <button onClick={addTodo} data-testid="add-todo-btn">Add</button>

      <ul data-testid="todo-list">
        {todos.map(todo => (
          <li key={todo.id}>
            {editId === todo.id ? (
              <>
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  data-testid="edit-todo-input"
                />
                <button onClick={saveEdit} data-testid="save-edit-btn">Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {todo.text}
                <button onClick={() => startEdit(todo)} data-testid="edit-btn">Edit</button>
                <button onClick={() => deleteTodo(todo.id)} data-testid="delete-btn">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
