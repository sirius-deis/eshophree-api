require('dotenv').config();
const { log } = require('mercedlogger');

const connect = require('./db/connection');
const app = require('./app');

const { PORT = 3000 } = process.env;

const start = () => {
    try {
        app.listen(PORT, () => {
            console.log(
                log.green('SERVER STATE', `Server is running on port: ${PORT}`)
            );
        });
        connect();
    } catch (error) {
        console.log(log.red('SERVER STATE', error));
        process.exit(1);
    }
};

start();
