const chalk = require('chalk');

module.exports = (type, color, info, log = '', ...rest) => {
    // eslint-disable-next-line no-console
    console[type](
        chalk[
            `bg${color[0].toUpperCase() + color.slice(1)}Bright`
        ].blackBright.bold(`${info.toUpperCase()}`),
        chalk[`${color}Bright`](log),
        chalk[`${color}Bright`].italic(rest)
    );
};
