import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { get as appContext } from "../../app-context";

const getCorrelationId = (req: Request) => {
  const correlationId = (req.headers["x-correlation-id"] ||
    req.headers["x-request-id"] ||
    uuid()) as string;

  return correlationId;
};

// TODO: Extract from JWT
const getUser = (req: Request) => req.headers["x-user-id"] as string;

export default (req: Request, _res: Response, next: NextFunction) => {
  const { baseUrl, path, method } = req;
  const correlationId = getCorrelationId(req);

  const childLogger = appContext()?.logger.child({
    correlationId,
    userId: getUser(req),
    req: {
      baseUrl,
      path,
      method,
    },
  });

  req.context = {
    correlationId,
    logger: childLogger,
  };

  next();
};
