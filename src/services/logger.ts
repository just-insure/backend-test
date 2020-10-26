import pino from "pino";

const formatters = {
  level: (severity: string, level: number) => ({ severity, level }),
};

const loggerConfig =
  process.env.NODE_ENV === "production"
    ? {
        redact: ["req.headers.authorization", 'req.headers["X-API-KEY"]'],
        formatters,
      }
    : {
        prettyPrint: {
          levelFirst: true,
        },
      };

export const create = (level: string) => {
  return pino({ ...loggerConfig, level }, pino.destination());
};
