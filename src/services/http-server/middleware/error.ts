import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";

export default (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const errorId = uuid();

  if (!!req.context?.logger) {
    req.context.logger.error(
      { error, errorId },
      "http middleware caught error"
    );
  }

  if (!res.headersSent) {
    res.status(500).send({
      errorCode: "Internal Server Error",
      msg: "There is a problem with our services.",
      errorId,
    });
  }
};
