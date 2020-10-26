import { Logger } from "pino";
import { Connection } from "typeorm";
import { Environment } from "./config";

export interface AppContext {
  logger: Logger;
  config: Environment;
  db: Connection;
}

let context: AppContext;
let isInitialised = false;

export const set = (appContext: AppContext) => {
  context = appContext;
  isInitialised = true;
};

export const get = () => {
  if (isInitialised) {
    return context;
  }
};
