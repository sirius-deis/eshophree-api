const { Server } = require('socket.io');
const authIO = require('./auth.socket');

const usersMap = new Map();
const managersMap = new Map();

module.exports = (server) => {
  const io = new Server(server);

  io.use(authIO);

  io.on('connection', (socket) => {
    if (socket.user && ['admin', 'manager'].includes(socket.user.role)) {
      managersMap.set(socket.user._id.toString(), socket);
      socket.join('managers');
    } else {
      usersMap.set(socket.user._id.toString() || socket.id, socket);
    }

    socket.on('question', (question) => {
      socket.broadcast.to('managers').emit('question', question);
    });

    socket.on('reply', ({ reply, id }) => {
      if (socket.user && ['admin', 'manager'].includes(socket.user.role)) {
        const targetSocket = usersMap.get(id);
        socket.to(targetSocket.id).emit('reply', reply);
      }
    });

    socket.on('connect_error', (error) => {
      socket.emit('exception', {
        error: 'Something went wrong. Please try again',
      });
    });
    socket.on('disconnect', () => {
      if (socket.user && ['admin', 'manager'].includes(socket.user.role)) {
        managersMap.delete(socket.user._id.toString());
        socket.leave('managers');
      } else {
        usersMap.delete(socket.user._id.toString() || socket.id);
      }
    });
  });
};
