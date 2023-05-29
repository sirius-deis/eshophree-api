require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const connect = require('./db/connection');
const app = require('./app');
const log = require('./utils/log');
const { redisConnect } = require('./db/redis');

const { PORT = 3000 } = process.env;

const server = http.createServer(app);
const io = new Server(server);
const authIO = require('./socket/auth.middleware');

const start = () => {
    try {
        connect();
        redisConnect();
        server.listen(PORT, () => {
            log(
                'log',
                'green',
                'server status',
                `Server is running on port: ${PORT}`
            );
        });
    } catch (error) {
        log('error', 'red', 'server status', error);
        /* eslint-disable */
        process.exit(1);
    }
};

/**
 * Socket io
 */

io.use(authIO);
io.on('connection', socket => {
    require('./socket/socket')(socket, io);
});

/**
 *
 */

[('unhandledRejection', 'uncaughtException')].forEach(event => {
    const index = event.search(/[A-Z]/);
    process.on(event, () => {
        log(
            'error',
            'red',
            'server status',
            `${event.slice(0, index).toUpperCase()} ${event
                .slice(index)
                .toUpperCase()}`
        );
        server.close(() => {
            /* eslint-disable */
            process.exit(1);
        });
    });
});

['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(event => {
    process.on(event, () => {
        log('info', 'green', 'server status', `${event} received`);
        server.close(() => {
            log('info', 'green', 'server status', 'Process terminated');
            /* eslint-disable */
            process.exit(1);
        });
    });
});

start();
