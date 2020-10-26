import express from "express";
import { Logger } from "pino";
import { Express } from "express";
import { get as appContext } from "../app-context";
import { Environment } from "../config";
import { error, logger, resource404 } from "./middleware";

export interface Context {
  logger?: Logger;
  userId?: string;
  correlationId: string;
}

declare global {
  namespace Express {
    export interface Request {
      context: Context;
    }
  }
}

let app: Express;
let port: number;

export const create = ({ PORT }: Environment) => {
  if (app) {
    return app;
  }

  port = PORT;
  app = express();
  app.use(logger);

  return app;
};

export const listen = async () => {
  if (!app) {
    throw new Error("Must create the server before listening to a port on it");
  }

  app.use(resource404);
  app.use(error);

  return new Promise((resolve) => {
    app.listen(port, () => {
      appContext()?.logger.info(`HTTP Server running on ${port}`);
      resolve();
    });
  });
};
