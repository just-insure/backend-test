import { Request, Response } from "express-serve-static-core";
import { createInteractors } from "../interactors";

export interface GetAllTripsQuery {
  take?: number;
  skip?: number;
  orderBy?: string;
  orderDir?: "ASC" | "DESC";
  search?: string;
}

export const getAllTripsForUser = async (
  req: Request<{ userId: number }, any, any, GetAllTripsQuery>,
  res: Response
) => {
  const { userId } = req.params;
  const {
    take = 100,
    skip = 0,
    orderBy = "",
    orderDir = "ASC",
    search = "",
  } = req.query;
  const { correlationId } = req.context;

  const { tripInteractor } = createInteractors(userId, correlationId);

  const trips = await tripInteractor.getAllTrips(
    take,
    skip,
    orderBy,
    orderDir,
    search
  );

  res.send(trips);
};

export const getTripForUser = async (
  req: Request<{ userId: number; tripId: string }>,
  res: Response
) => {
  const { userId, tripId } = req.params;
  const { correlationId } = req.context;

  const { tripInteractor } = createInteractors(userId, correlationId);
  const trip = await tripInteractor.getTripData(tripId);

  res.send(trip);
};
