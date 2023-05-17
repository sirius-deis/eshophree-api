require('dotenv').config();
const path = require('path');
const { log } = require('mercedlogger');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const connect = require('./db/connection');
const userRoutes = require('./routes/user.routes');
const productRouter = require('./routes/product.routes');
const cartRouter = require('./routes/cart.routes');

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');

const app = express();

const corsOptions = {
    origin: true,
    credentials: true,
};

const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour',
});

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cors(corsOptions));
app.use(morgan('tiny'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);

const { PORT = 3000 } = process.env;

const start = () => {
    try {
        app.listen(PORT, () => {
            console.log(
                log.green('SERVER STATE', `Server is running on port: ${PORT}`)
            );
        });
    } catch (error) {
        console.log(log.red('SERVER STATE', error));
        process.exit(1);
    }
};

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/carts', cartRouter);

app.all(
    '*',
    catchAsync(req => {
        throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
    })
);

connect();

start();
