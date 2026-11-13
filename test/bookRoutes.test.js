const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const { createApp } = require('../src/app');

let server;

after(() => {
  if (server) {
    server.close();
  }
});

test('GET /api/books returns the JSON list from the controller', async () => {
  const expectedBooks = [
    { title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', status: 'available' }
  ];
  const app = createApp({
    getBooks(_request, response) {
      response.json(expectedBooks);
    }
  });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/books`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expectedBooks);
});
