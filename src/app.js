const express = require('express');
const mongoose = require('mongoose');
const bookService = require('./services/bookService');
const createBookRouter = require('./routes/bookRoutes');

function createApp(controller) {
  const app = express();
  app.use(express.json());
  app.use('/api/books', createBookRouter(controller));
  return app;
}

const app = createApp();

async function startServer() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hogwarts-bibliotek';
  await mongoose.connect(mongoUri);
  await bookService.ensureInitialBooks();

  const port = process.env.PORT || 3000;
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exitCode = 1;
  });
}

module.exports = { app, createApp, startServer };