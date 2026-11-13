const bookService = require('../services/bookService');

async function getBooks(_request, response, next) {
  try {
    const books = await bookService.listBooks();
    response.json(books);
  } catch (error) {
    next(error);
  }
}

module.exports = { getBooks };