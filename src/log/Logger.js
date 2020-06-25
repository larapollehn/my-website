const log = require('loglevel');
const prefix = require('loglevel-plugin-prefix');
const chalk = require('chalk');

const colors = {
    TRACE: chalk.magenta,
    DEBUG: chalk.cyan,
    INFO: chalk.blue,
    WARN: chalk.yellow,
    ERROR: chalk.red,
};

prefix.reg(log);

prefix.apply(log, {
    format(level, name, timestamp) {
        return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)} ${chalk.green(`${name}:`)}`;
    },
});

prefix.apply(log.getLogger('critical'), {
    format(level, name, timestamp) {
        return chalk.red.bold(`[${timestamp}] ${level} ${name}:`);
    },
});

switch (process.env.LOG_LEVEL) {
    case "debug":
        log.setDefaultLevel(log.levels.DEBUG);
        break;
    case "info":
        log.setDefaultLevel(log.levels.INFO);
        break;
    default:
        log.setDefaultLevel(log.levels.WARN);
        break;
}

module.exports = log;