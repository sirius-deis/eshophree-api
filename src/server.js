require('dotenv').config();
const http = require('http');

const connect = require('./db/connection');
const app = require('./app');
const log = require('./utils/log');

const { PORT = 3000 } = process.env;

const server = http.createServer(app);

const start = () => {
    try {
        server.listen(PORT, () => {
            log(
                'log',
                'green',
                'server status',
                `Server is running on port: ${PORT}`
            );
        });
        connect();
    } catch (error) {
        log('error', 'red', 'server status', error);
        process.exit(1);
    }
};

['unhandledRejection', 'uncaughtException'].forEach(event => {
    const index = event.search(/[A-Z]/);
    process.on(event, error => {
        log(
            'error',
            'red',
            'server status',
            `${event.slice(0, index).toUpperCase()} ${event
                .slice(index)
                .toUpperCase()}`
        );
        server.close(() => {
            process.exit(1);
        });
    });
});

['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(event => {
    process.on(event, () => {
        log('info', 'green', 'server status', `${event} received`);
        server.close(() => {
            log('info', 'green', 'server status', 'Process terminated');
        });
    });
});

start();
