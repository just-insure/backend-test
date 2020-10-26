import { create as createLogger } from "./services/logger";
import { read as readConfig } from "./services/config";
import {
  get as appContext,
  set as setAppContext,
} from "./services/app-context";
import {
  create as createHttpServer,
  listen as listenHttp,
} from "./services/http-server";
import { create as createDbConnection } from "./services/db";
import { applyRoutes } from "./apply-routes";
import { subscribeListeners } from "./subscribe-listeners";

const start = async () => {
  try {
    const config = readConfig();
    const logger = createLogger(config.LOG_LEVEL);
    const db = await createDbConnection(config);

    setAppContext({ logger, config, db });

    subscribeListeners();

    const server = await createHttpServer(config);
    applyRoutes(server);
    listenHttp();
  } catch (error) {
    // tslint:disable-next-line: no-console
    const logError = appContext()?.logger.fetal ?? console.error;
    logError(error, "Application failure");
  }
};

start();
