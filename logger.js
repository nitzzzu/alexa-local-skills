const winston = require('winston');
const fs = require('fs');

const timestampFormat = () => new Date().toLocaleTimeString();
const logsDir = 'logs';

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

winston.add(winston.transports.File, {
    filename: `${logsDir}/log.log`,
    timestamp: timestampFormat,
    json: false,
    level: 'info'
});

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    timestamp: timestampFormat,
    colorize: true,
    level: 'info'
});

module.exports = winston;
