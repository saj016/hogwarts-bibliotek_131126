const Book = require('../models/bookModel');

async function findAll() {
  return Book.find().lean().exec();
  // lean() returns plain JavaScript objects instead of Mongoose documents, which can be more efficient for read-only operations
    // exec() executes the query and returns a promise.
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

module.exports = { findAll, ensureSeedBooks };