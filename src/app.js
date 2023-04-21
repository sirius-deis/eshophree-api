require("dotenv").config();
const { log } = require("mercedlogger");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const connect = require("./db/connection");

const app = express();

const corsOptions = {
    origin: true,
    credential: true,
};

app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());

const { PORT = 3000 } = process.env;

const start = () => {
    try {
        app.listen(PORT, () => {
            console.log(log.green("SERVER STATE", `Server is running on port: ${PORT}`));
        });
    } catch (error) {
        console.log(log.red("SERVER STATE", error));
        process.exit(1);
    }
};

connect();

start();
