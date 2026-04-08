import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: { service: "frontend" },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.LOG_PRETTY === "true" && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
    },
  }),
});

export default logger;
