const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true // automatically removes whitespace from both ends of the string
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'borrowed'],
    required: true,
    default: 'available'
  }
});

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);