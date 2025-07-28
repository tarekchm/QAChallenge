const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:3000';

test.describe('Todo App UI tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('login with valid credentials', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', 'user1');
    await page.fill('[data-testid="password-input"]', 'password1');
    await page.click('[data-testid="login-btn"]');
    await expect(page.locator('h2')).toHaveText('Todo List');
  });

  test('login with invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', 'user1');
    await page.fill('[data-testid="password-input"]', 'wrongpass');
    await page.click('[data-testid="login-btn"]');
    await expect(page.locator('text=Invalid username or password')).toBeVisible();
  });

  test('create, edit, and delete todo', async ({ page }) => {
    const todoText = 'New Test Todo';
    const updatedText = 'Updated Test Todo';

    // Login
    await page.fill('[data-testid="username-input"]', 'user1');
    await page.fill('[data-testid="password-input"]', 'password1');
    await page.click('[data-testid="login-btn"]');

    // Create
    await page.fill('[data-testid="new-todo-input"]', todoText);
    await page.click('[data-testid="add-todo-btn"]');
    const todoItem = page.locator('ul li', { hasText: todoText }).last();
    await expect(todoItem).toBeVisible();

    // Edit
    const lastEditBtn = page.locator('[data-testid="edit-btn"]').last();
    await lastEditBtn.click();
    await page.fill('[data-testid="edit-todo-input"]', updatedText);
    await page.click('[data-testid="save-edit-btn"]');
    const updatedTodoItem = page.locator('ul li', { hasText: updatedText }).last();
    await expect(updatedTodoItem).toBeVisible();

    // Delete
    const lastDeleteBtn = page.locator('[data-testid="delete-btn"]').last();
    await lastDeleteBtn.click();
    await expect(page.locator('ul li', { hasText: updatedText })).toHaveCount(0);
  });
});
