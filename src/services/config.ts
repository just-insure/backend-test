// tslint:disable-next-line
require("dotenv").config();
import Joi from "@hapi/joi";

export interface Environment {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  LOG_LEVEL: string;
}

const envSchema = {
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().note("Port to bind your app").required(),
  DATABASE_URL: Joi.string().note("Connections string for PG DB").required(),
  LOG_LEVEL: Joi.string()
    .valid("fatal", "error", "warn", "info", "debug", "trace", "silent")
    .required(),
};

export const read = () => {
  const schema = Joi.object(envSchema);
  const schemaValidationResult = schema.validate(process.env, {
    convert: true,
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (schemaValidationResult.error) {
    // tslint:disable-next-line: no-console
    console.error(
      "Failed parsing configuration",
      schemaValidationResult.error.message
    );
    process.exit(-1);
  }

  // Joi.string().replace('test', 'development').allow('production', 'development', 'test').required() does not work
  // as soon as allow() / valid() is used the replacement doesn't occur
  // So we have to replace it manually after validation:
  const nodeEnv =
    schemaValidationResult.value.NODE_ENV === "production"
      ? "production"
      : "development";

  const config = {
    ...(schemaValidationResult.value as object),
    NODE_ENV: nodeEnv,
  } as Environment;

  const schemaKeys = Object.keys(envSchema);
  const configKeysWithoutValidation = Object.keys(config).filter(
    (key) => !schemaKeys.includes(key)
  );

  if (configKeysWithoutValidation.length > 0) {
    // tslint:disable-next-line: no-console
    console.error(
      "Some config keys do not have schema defined: ",
      configKeysWithoutValidation
    );
    process.exit(-2);
  }

  return config;
};
