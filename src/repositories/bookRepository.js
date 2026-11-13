const Book = require('../models/bookModel');

async function findAll() {
  return Book.find().lean().exec();
  // lean() returns plain JavaScript objects instead of Mongoose documents, which can be more efficient for read-only operations
    // exec() executes the query and returns a promise.
}

async function create(book) {
  const createdBook = await Book.create(book);
  return createdBook.toObject();
}

async function findById(id) {
  return Book.findById(id).lean().exec();
}

async function borrowIfAvailable(id, studentName) { // This function attempts to borrow a book in one database operation, ensuring that the book is only borrowed if it is currently available. This prevents race conditions where multiple students might try to borrow the same book at the same time.
  return Book.findOneAndUpdate(
    { _id: id, status: 'available' },
    { $set: { status: 'borrowed', borrowedBy: studentName } },
    { new: true, runValidators: true } // new: true returns the updated document, runValidators: true ensures that the update operation respects the schema's validation rules
  ).lean().exec();
}

async function returnIfBorrowed(id) {
  return Book.findOneAndUpdate(
    { _id: id, status: 'borrowed' },
    { $set: { status: 'available' }, $unset: { borrowedBy: 1 } },
    { new: true, runValidators: true }
  ).lean().exec();
}

async function ensureSeedBooks(books) {
  await Book.bulkWrite( // BulkWrite allows for multiple write operations in a single request, which can be more efficient than individual writes.
    books.map((book) => ({
      updateOne: {
        filter: { title: book.title },// Filter to find a book with the same title
        update: { $setOnInsert: book }, // Only set the book data if a matching document is not found (insert), prevents overriding
        upsert: true // If match is found, update, else create new book with the provided data
      }
    }))
  );
}

module.exports = { findAll, create, findById, borrowIfAvailable, returnIfBorrowed, ensureSeedBooks };