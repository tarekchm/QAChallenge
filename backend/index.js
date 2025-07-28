const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const JWT_SECRET = 'mysecretkey'; // In real app, keep in env vars
const PORT = 4001;

// Mock DB
const users = [
  { id: 1, username: 'user1', passwordHash: bcrypt.hashSync('password1', 10) }
];

let todos = [
  { id: 1, userId: 1, text: 'Learn testing', completed: false },
  { id: 2, userId: 1, text: 'Write code', completed: true }
];

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if(!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if(!token) return res.status(401).json({ message: 'Malformed token' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if(err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if(!user) return res.status(401).json({ message: 'Invalid username or password' });

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if(!validPassword) return res.status(401).json({ message: 'Invalid username or password' });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// GET /items
app.get('/items', authMiddleware, (req, res) => {
  const userTodos = todos.filter(t => t.userId === req.user.id);
  res.json(userTodos);
});

// POST /items
app.post('/items', authMiddleware, (req, res) => {
  const { text } = req.body;
  if(!text) return res.status(400).json({ message: 'Text is required' });
  const newTodo = { id: todos.length + 1, userId: req.user.id, text, completed: false };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /items/:id
app.put('/items/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { text, completed } = req.body;
  const todo = todos.find(t => t.id === id && t.userId === req.user.id);
  if(!todo) return res.status(404).json({ message: 'Todo not found' });

  if(text !== undefined) todo.text = text;
  if(completed !== undefined) todo.completed = completed;
  res.json(todo);
});

// DELETE /items/:id
app.delete('/items/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex(t => t.id === id && t.userId === req.user.id);
  if(index === -1) return res.status(404).json({ message: 'Todo not found' });
  todos.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = app; // for testing
