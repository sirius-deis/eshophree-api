require("dotenv").config();
const { log } = require("mercedlogger");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const connect = require("./db/connection");

const app = express();

const corsOptions = {
    origin: true,
    credential: true,
};

const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP, please try again in an hour",
});

app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);

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

app.get("/", (req, res) => {
    res.status(200).json({ message: "OK" });
});

connect();

start();
