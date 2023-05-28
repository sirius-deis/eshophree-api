const crypto = require('crypto');

const managersSockets = new Set();
const clientsSockets = new Set();

module.exports = function (socket, io) {
    if (socket.user.role === 'moderator') {
        managersSockets.add(socket.id);
    } else {
        clientsSockets.add(socket.id);
    }
    socket.on('help', msg => {
        io.emit('answer', { message: 'hello socket' });
    });

    // socket.on('connect_error', error => {
    //     socket.emit('exception', {
    //         error: 'Something went wrong. Please try again',
    //     });
    // });

    socket.on('disconnect', () => {
        if (socket.user.role === 'moderator') {
            managersSockets.delete(socket.id);
        } else {
            clientsSockets.delete(socket.id);
        }
    });
};
