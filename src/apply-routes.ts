import { Express, Router } from "express";
import { getTripForUser, getAllTripsForUser } from "./controllers";

export const applyRoutes = (server: Express) => {
  const router = Router({ mergeParams: true });

  router.get("/users/:userId/trips", getAllTripsForUser);
  router.get("/users/:userId/trip/:tripId", getTripForUser);

  server.use("/", router);
};
