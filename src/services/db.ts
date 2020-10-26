import "reflect-metadata";
import { createConnection } from "typeorm";
import { Environment } from "./config";
import { CompletedTrip } from "../models/completed-trip";

export const create = async ({ DATABASE_URL: url }: Environment) => {
  return await createConnection({
    type: "postgres",
    url,
    entities: [CompletedTrip],
    synchronize: true,
    logging: true,
  });
};
