const request = require('supertest');
const app = require('../index');

let token = '';

describe('API Tests', () => {
  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post('/login')
      .send({ username: 'user1', password: 'password1' });
    token = res.body.token;
  });

  test('POST /login - invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'user1', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /items - get todos', async () => {
    const res = await request(app)
      .get('/items')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /items - create todo', async () => {
    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Test new todo' });
    expect(res.statusCode).toBe(201);
    expect(res.body.text).toBe('Test new todo');
  });

  test('POST /items - missing text', async () => {
    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('PUT /items/:id - update todo', async () => {
    const newTodo = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'To be updated' });
    const res = await request(app)
      .put(`/items/${newTodo.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Updated todo', completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBe('Updated todo');
    expect(res.body.completed).toBe(true);
  });

  test('PUT /items/:id - invalid ID', async () => {
    const res = await request(app)
      .put('/items/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Should fail' });
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /items/:id - delete todo', async () => {
    const newTodo = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'To be deleted' });
    const res = await request(app)
      .delete(`/items/${newTodo.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /items/:id - invalid ID', async () => {
    const res = await request(app)
      .delete('/items/99999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
