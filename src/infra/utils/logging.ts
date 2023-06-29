import {
  Logger as WinstonLogger,
  createLogger,
  format,
  transports,
} from "winston";
const { combine, errors, timestamp, printf } = format;

class AppLogger implements Logger {
  constructor(private readonly logger: WinstonLogger) {}

  error(msg: string, meta?: any): void {
    this.logger.error(msg, { meta });
  }
  warn(msg: string, meta?: any): void {
    this.logger.warn(msg, { meta });
  }
  info(msg: string, meta?: any): void {
    this.logger.info(msg, { meta });
  }
  debug(msg: string, meta?: any): void {
    this.logger.debug(msg, { meta });
  }
}

const customFormat = printf((info) => {
  const components = [`[${info.level}]\t${info.timestamp}: ${info.message}`];
  if (info.meta) {
    components.push(`Meta: ${JSON.stringify(info.meta)}`);
  }
  if (info.stack) {
    components.push(info.stack);
  }
  if (info.cause) {
    components.push(`Caused by: ${info.cause.stack}`);
  }

  return components.join("\n");
});

const winstonLogger = createLogger({
  level: "debug",
  format: combine(errors({ stack: true }), timestamp(), customFormat),
  transports: [new transports.Console()],
});

const logger = new AppLogger(winstonLogger);

export { logger as applicationLogger };
