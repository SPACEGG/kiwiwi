import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(import.meta.dirname, '../logs');
const { combine, timestamp, printf } = winston.format;

// Define log format
const logFormat = printf((info) => {
    return `[${info.timestamp}] [kiwiwi ${info.level}] ${info.message}`;
});

const isDev = process.env.NODE_ENV !== 'production' ? 'dev_' : '';
const logger = winston.createLogger({
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        logFormat
    ),
    transports: [
        new winstonDaily({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `${isDev}%DATE%.log`,
            maxFiles: 30, // 30 days
            zippedArchive: true,
        }),
        new winstonDaily({
            level: 'warn',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/warn',
            filename: `${isDev}%DATE%.warn.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error',
            filename: `${isDev}%DATE%.error.log`,
            maxFiles: 30,
            zippedArchive: true,
        }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                logFormat
            ),
        })
    );
}

export default logger;
