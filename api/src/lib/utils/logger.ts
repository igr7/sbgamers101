import winston from 'winston'

const { combine, timestamp, printf, colorize, json } = winston.format

const logFormat = winston.format((info) => {
  const { level, message, timestamp, ...metadata } = info
  let msg = `${timestamp} [${level}]: ${message}`
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  return { ...info, message: msg }
})

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat(),
        printf((info) => info.message as string)
      ),
    }),
  ],
})

if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  )
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  )
}

interface LogMetadata {
  [key: string]: unknown
}

export const log = {
  info: (message: string, meta?: LogMetadata): void => {
    logger.info(message, meta || {})
  },
  error: (message: string, meta?: LogMetadata): void => {
    logger.error(message, meta || {})
  },
  warn: (message: string, meta?: LogMetadata): void => {
    logger.warn(message, meta || {})
  },
  debug: (message: string, meta?: LogMetadata): void => {
    logger.debug(message, meta || {})
  },
}

export default logger