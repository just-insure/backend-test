import { Request, Response } from "express";

export default (req: Request, res: Response) => {
  const logger = req.context?.logger;
  if (logger) {
    logger.info("Path not found");
  }
  res.sendStatus(404);
};
