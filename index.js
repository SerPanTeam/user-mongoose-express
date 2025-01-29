import app from './app.js';
import 'dotenv/config.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3333;

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Функция для "мягкой" остановки
function gracefulShutdown() {
  console.log('Received kill signal, shutting down gracefully...');
  // Перестаём принимать новые подключения
  if (server) {
    server.close(() => {
      console.log('Closed out remaining connections');
      // Закрываем коннект к Mongo
      mongoose.connection.close(false, () => {
        console.log('MongoDb connection closed.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', gracefulShutdown); // Ctrl + C
process.on('SIGTERM', gracefulShutdown); // kill или остановка на сервере

startServer();
