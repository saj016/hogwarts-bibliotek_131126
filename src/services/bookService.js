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

async function listBooks() {
  return bookRepository.findAll();
}

async function ensureInitialBooks() {
  return bookRepository.ensureSeedBooks(initialBooks);
}

module.exports = { listBooks, ensureInitialBooks };