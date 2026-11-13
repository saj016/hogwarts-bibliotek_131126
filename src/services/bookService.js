const mongoose = require('mongoose');
const bookRepository = require('../repositories/bookRepository');

const initialBooks = [
  {
    title: " Advanced Potion-Making",
    author: 'Libatius Borage',
    status: 'available'
  },
  {
    title: 'Hogwarts: A History',
    author: 'Bathilda Bagshot',
    status: 'available'
  },
  {
    title: 'The Standard Book of Spells',
    author: 'Miranda Goshawk',
    status: 'available'
  }
];

class BookServiceError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'BookServiceError';
    this.statusCode = statusCode;
  }
}

function createBookService(repository = bookRepository) {
  async function listBooks() {
    return repository.findAll();
  }

  async function createBook(input) {
    const title = typeof input?.title === 'string' ? input.title.trim() : '';
    const author = typeof input?.author === 'string' ? input.author.trim() : '';
    const status = input?.status ?? 'available'; // input?.status uses "optional chaining", giving undefined if = undefined/null. "nullish coalescing"; If status is present use that value, otherwise assign "available"
    const borrowedBy = typeof input?.borrowedBy === 'string' ? input.borrowedBy.trim() : '';

    if (!title || !author) {
      throw new BookServiceError(400, 'Title and author are required.');
    }
    if (!['available', 'borrowed'].includes(status)) {
      throw new BookServiceError(400, 'Status must be available or borrowed.');
    }
    if (status === 'borrowed' && !borrowedBy) {
      throw new BookServiceError(400, 'A student name is required for a borrowed book.');
    }

    const book = { title, author, status };
    if (status === 'borrowed') {
      book.borrowedBy = borrowedBy;
    }
    return repository.create(book);
  }

  async function borrowBook(id, studentName) {
    if (typeof studentName !== 'string' || !studentName.trim()) {
      throw new BookServiceError(400, 'Student name is required.');
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new BookServiceError(404, 'Book not found.');
    }

    const book = await repository.borrowIfAvailable(id, studentName.trim());
    if (book) {
      return book;
    }

    if (!(await repository.findById(id))) {
      throw new BookServiceError(404, 'Book not found.');
    }
    throw new BookServiceError(409, 'Book is already borrowed.');
  }

  async function returnBook(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BookServiceError(400, 'Book is not borrowed.');
    }

    const book = await repository.returnIfBorrowed(id);
    if (!book) {
      throw new BookServiceError(400, 'Book is not borrowed.');
    }
    return book;
  }

  async function ensureInitialBooks() {
    return repository.ensureSeedBooks(initialBooks);
  }

  return { listBooks, createBook, borrowBook, returnBook, ensureInitialBooks };
}

module.exports = { ...createBookService(), createBookService, BookServiceError };