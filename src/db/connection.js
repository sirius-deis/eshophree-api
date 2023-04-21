const mongoose = require("mongoose");
const { log } = require("mercedlogger");

const connect = () => {
    mongoose.connect(`mongodb://localhost:27017`, { useNewUrlParser: true, useUnifiedTopology: true });

    mongoose.connection
        .on("open", () => log.green("DATABASE STATE", "Connection established"))
        .on("close", () => log.magenta("DATABASE STATE", "Connection close"))
        .on("error", (error) => log.red("DATABASE STATE", error));
};

module.exports = connect;
