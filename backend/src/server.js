import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config({
  path: './.env',
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

    io.on('connection', (socket) => {
      // console.log(`Socket connected: ${socket.id}`);

      socket.on('setup', (userData) => {
        socket.join(userData?._id);
        socket.emit('connected');
      });

      socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User Joined Room', room);
      });

      socket.on('typing', (room) => socket.in(room).emit('typing'));
      socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

      socket.on('new message', (newMessageRecieved) => {
        // console.log(newMessageRecieved, 'xchbb');

        let chat = newMessageRecieved?.chat;
        if (!chat.users) return 

        chat?.users.forEach((user) => {
          if (user?._id == newMessageRecieved?.sender._id) return;

          socket.in(user._id).emit('message recieved', newMessageRecieved);
        });
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  })
  .catch((err) => {
    console.error(`MongoDB connection failed: ${err}`);
  });
