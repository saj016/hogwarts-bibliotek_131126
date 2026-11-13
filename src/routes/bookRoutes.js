const express = require('express');
const bookController = require('../controllers/bookController');

function createBookRouter(controller = bookController) {
  const router = express.Router();
  router.get('/', controller.getBooks);
  return router;
}

module.exports = createBookRouter;