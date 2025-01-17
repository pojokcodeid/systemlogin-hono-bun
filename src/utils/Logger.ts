import winston from "winston";
import "winston-daily-rotate-file";

/**
 * Class untuk mengatur logger
 *
 * @class Logger
 */
class Logger {
  private transport;

  /**
   * Constructor untuk membuat logger dengan konfigurasi
   */
  constructor() {
    this.transport = new winston.transports.DailyRotateFile({
      filename: "./logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "1m",
      maxFiles: "14d",
      level: "error",
      handleExceptions: true,
    });
  }

  /**
   * Buat logger dengan konfigurasi yang telah di set
   * untuk digunakan dalam proses logging
   */
  public setLogger() {
    return winston.createLogger({
      level: "silly",
      format: winston.format.combine(
        winston.format.json({ space: 2 }),
        winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
        winston.format.label({ label: "[LOGGER]" }),
        winston.format.printf(
          (info) =>
            ` ${info.label} ${info.timestamp} ${info.level} : ${info.message}`
        )
      ),
      transports: [this.transport],
    });
  }
}

export default new Logger().setLogger();
