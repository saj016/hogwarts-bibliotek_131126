const bookService = require('../services/bookService');

function createBookController(service = bookService) {
  function handleError(error, response, next) {
    if (error instanceof bookService.BookServiceError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }

  async function getBooks(_request, response, next) {
    try {
      response.json(await service.listBooks());
    } catch (error) {
      handleError(error, response, next);
    }
  }

  async function createBook(request, response, next) {
    try {
      const book = await service.createBook(request.body);
      response.status(201).json(book);
    } catch (error) {
      handleError(error, response, next);
    }
  }

  async function borrowBook(request, response, next) {
    try {
      const book = await service.borrowBook(request.params.id, request.body?.studentName);
      response.json(book);
    } catch (error) {
      handleError(error, response, next);
    }
  }

  async function returnBook(request, response, next) {
    try {
      const book = await service.returnBook(request.params.id);
      response.json(book);
    } catch (error) {
      handleError(error, response, next);
    }
  }

  return { getBooks, createBook, borrowBook, returnBook };
}

module.exports = { ...createBookController(), createBookController };