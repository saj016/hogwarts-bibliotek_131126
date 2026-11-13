const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createApp } = require('../src/app');
const { createBookController } = require('../src/controllers/bookController');
const { createBookService } = require('../src/services/bookService');

const bookId = '507f1f77bcf86cd799439011';

function createTestApp() {
  const books = new Map();
  let nextId = 1;
  const repository = {
    async findAll() {
      return [...books.values()];
    },
    async create(book) {
      const created = { _id: String(nextId++), ...book };
      books.set(created._id, created);
      return created;
    },
    async findById(id) {
      return books.get(id) || null;
    },
    async borrowIfAvailable(id, studentName) {
      const book = books.get(id);
      if (!book || book.status !== 'available') {
        return null;
      }
      book.status = 'borrowed';
      book.borrowedBy = studentName;
      return book;
    },
    async returnIfBorrowed(id) {
      const book = books.get(id);
      if (!book || book.status !== 'borrowed') {
        return null;
      }
      book.status = 'available';
      delete book.borrowedBy;
      return book;
    }
  };
  const service = createBookService(repository);
  const app = createApp(createBookController(service));
  return { app, books };
}

async function request(app, path, options = {}) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    return await fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function jsonOptions(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

test('GET /api/books returns the JSON list', async () => {
  const { app, books } = createTestApp();
  books.set('1', { _id: '1', title: 'Hogwarts: A History', author: 'Bathilda Bagshot', status: 'available' });

  const response = await request(app, '/api/books');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [...books.values()]);
});

test('POST /api/books creates a book', async () => {
  const { app } = createTestApp();

  const response = await request(app, '/api/books', jsonOptions({
    title: 'Hogwarts: A History',
    author: 'Bathilda Bagshot'
  }));

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    _id: '1',
    title: 'Hogwarts: A History',
    author: 'Bathilda Bagshot',
    status: 'available'
  });
});

test('POST /api/books/:id/borrow records the student name', async () => {
  const { app, books } = createTestApp();
  books.set(bookId, { _id: bookId, title: 'Hogwarts: A History', author: 'Bathilda Bagshot', status: 'available' });

  const response = await request(app, `/api/books/${bookId}/borrow`, jsonOptions({ studentName: 'Harry Potter' }));

  assert.equal(response.status, 200);
  assert.equal((await response.json()).borrowedBy, 'Harry Potter');
});

test('POST /api/books/:id/borrow returns 409 for a book already borrowed', async () => {
  const { app, books } = createTestApp();
  books.set(bookId, { _id: bookId, status: 'borrowed', borrowedBy: 'Harry Potter' });

  const response = await request(app, `/api/books/${bookId}/borrow`, jsonOptions({ studentName: 'Hermione Granger' }));

  assert.equal(response.status, 409);
});

test('POST /api/books/:id/borrow returns 400 when the student name is missing', async () => {
  const { app } = createTestApp();

  const response = await request(app, `/api/books/${bookId}/borrow`, jsonOptions({}));

  assert.equal(response.status, 400);
});

test('POST /api/books/:id/borrow returns 404 for an unknown book ID', async () => {
  const { app } = createTestApp();

  const response = await request(app, `/api/books/${bookId}/borrow`, jsonOptions({ studentName: 'Harry Potter' }));

  assert.equal(response.status, 404);
});

test('POST /api/books/:id/return makes a borrowed book available and clears its borrower', async () => {
  const { app, books } = createTestApp();
  books.set(bookId, {
    _id: bookId,
    title: 'Hogwarts: A History',
    author: 'Bathilda Bagshot',
    status: 'borrowed',
    borrowedBy: 'Harry Potter'
  });

  const response = await request(app, `/api/books/${bookId}/return`, { method: 'POST' });
  const returnedBook = await response.json();

  assert.equal(response.status, 200);
  assert.equal(returnedBook.status, 'available');
  assert.equal('borrowedBy' in returnedBook, false);
});

test('POST /api/books/:id/return returns 400 for a book that is not borrowed', async () => {
  const { app, books } = createTestApp();
  books.set(bookId, {
    _id: bookId,
    title: 'Hogwarts: A History',
    author: 'Bathilda Bagshot',
    status: 'available'
  });

  const response = await request(app, `/api/books/${bookId}/return`, { method: 'POST' });

  assert.equal(response.status, 400);
});
