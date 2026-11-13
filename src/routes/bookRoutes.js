const express = require('express');
const bookController = require('../controllers/bookController');

function createBookRouter(controller = bookController) {
  const router = express.Router();
  router.get('/', controller.getBooks);
  router.post('/', controller.createBook);
  router.post('/:id/borrow', controller.borrowBook);
  router.post('/:id/return', controller.returnBook);
  return router;
}

module.exports = createBookRouter;