const { Server } = require('socket.io');
const authIO = require('./auth.socket');

module.exports = (server) => {
  const io = new Server(server);

  io.use(authIO);

  io.on('connection', (socket) => {
    socket.on('message', (msg) => {
      io.emit('reply', { message: 'hello socket' });
    });

    socket.on('connect_error', (error) => {
      socket.emit('exception', {
        error: 'Something went wrong. Please try again',
      });
    });
    socket.on('disconnect', () => {});
  });
};
