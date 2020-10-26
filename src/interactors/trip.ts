import { URL } from "url";
import { DateTime, Interval } from "luxon";
import { Logger } from "pino";
import { getRepository } from "typeorm";
import { CompletedTrip } from "../models/completed-trip";
import { Analytics } from "../services/analytics";
import { BalanceInteractor } from "./balance";
import { PolicyInteractor } from "./policy";
import { userNotificationTrip } from "../services/user-notification";
import { readJson } from "../services/gcp-storage";

export interface TripSummary {
  start: string;
  end: string;
  distance: number;
  duration: string;
  tripDataUrl: string;
  tripRawDataUrl: string;
}

interface Acceleration {
  x: number;
  y: number;
  z: number;
}

interface Location {
  lat: number;
  long: number;
}

interface DataPoints {
  accelerationDataPoints: Acceleration[];
  locationDataPoints: Location[];
}

export class TripInteractor {
  private userId: number;
  private logger: Logger;
  private balanceInteractor: BalanceInteractor;
  private policyInteractor: PolicyInteractor;
  private analytics: Analytics;

  constructor(
    analyticsContext: any,
    logger: Logger,
    balanceInteractor: BalanceInteractor,
    policyInteractor: PolicyInteractor,
    userId: number
  ) {
    this.logger = logger.child({ service: "trip" });
    this.balanceInteractor = balanceInteractor;
    this.policyInteractor = policyInteractor;
    this.userId = userId;

    this.analytics = new Analytics(this.logger, analyticsContext);
  }

  public async createTrip(tripId: string, trip: TripSummary) {
    this.logger.trace({ trip, tripId }, "onTripCompleted");

    const { start, end, distance } = trip;

    const tripPeriod = Interval.fromDateTimes(
      DateTime.fromISO(start),
      DateTime.fromISO(end)
    );

    const cost = await this.getChargeForTrip(tripPeriod, distance);

    if (!cost) {
      this.logger.warn("Received trip outside of any policy");
      return;
    }

    const transactionId = await this.balanceInteractor.charge(cost);
    await this.createCompletedTrip(tripId, trip, transactionId, cost);

    await userNotificationTrip(distance, cost, this.userId);
    this.analytics.track({
      event: "tripProcessed",
      properties: { start, end, distance, cost, transactionId },
    });
  }

  public async getAllTrips(
    take: number,
    skip: number,
    orderBy: string,
    orderDir: "ASC" | "DESC",
    search: string
  ) {
    const order =
      orderBy === "id"
        ? "completed_trip_id"
        : orderBy === "cost"
        ? "transaction_amount"
        : orderBy;

    const query = getRepository(CompletedTrip)
      .createQueryBuilder("completed_trip")
      .leftJoinAndSelect("completed_trip.transaction", "transaction")
      .orderBy(`"${order}"`, orderDir, "NULLS LAST")
      .limit(take)
      .offset(skip * take);

    if (search) {
      query.where('completed_trip."id" ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [result, total] = await query.getManyAndCount();

    const serialised = result.map(
      ({ id, start, end, distance, cost, tripDataUrl, transactionId }) => ({
        id,
        start,
        end,
        distance,
        cost,
        transactionId,
        hasTripData: !!tripDataUrl,
      })
    );

    return {
      items: {
        results: serialised,
        total,
      },
    };
  }

  public async getTrips() {
    const trips = await CompletedTrip.find({
      where: {
        user: this.userId,
      },
      order: {
        start: "DESC",
      },
      relations: ["transaction"],
    });

    const result = trips.map(
      ({ id, start, end, distance, cost, tripDataUrl }) => ({
        id,
        start,
        end,
        distance,
        cost,
        tripDataUrl,
      })
    );

    return result;
  }

  public async getTripData(tripId: number) {
    const trip = await CompletedTrip.findOne({
      where: { id: tripId },
    });

    if (!trip) {
      return;
    }

    const { cost, tripDataUrl, start, end, distance, duration } = trip;

    if (!tripDataUrl) {
      throw new Error("Trip details not found");
    }

    const dataPoints = await this.getDataPoints(tripDataUrl);

    return {
      id: tripId,
      start,
      end,
      distance,
      duration,
      cost,
      accelerationDataPoints: dataPoints?.accelerationDataPoints,
      locationDataPoints: dataPoints?.locationDataPoints,
    };
  }

  private getDataPoints(location: string) {
    const url = new URL(location);
    if (url.protocol !== "legacy:") {
      try {
        return readJson<DataPoints>(location);
      } catch (error) {
        // We're hiding the error from the client but we should raise in API as a full error for investigation
        this.logger.error(error);
      }
    }
  }

  private async createCompletedTrip(
    id: string,
    trip: TripSummary,
    transactionId: number,
    cost: number
  ) {
    try {
      await CompletedTrip.create({
        ...trip,
        cost,
        transactionId,
        userId: this.userId as any,
      }).save();
    } catch (error) {
      // We are idempotent and so could be requested to create twice for the same trip
      if (error.code && error.code === "23505") {
        this.logger.info({ id }, error.message);
      } else {
        throw error;
      }
    }
  }

  private async getChargeForTrip(period: Interval, distance: number) {
    this.logger.trace({ period, distance }, "getChargeForTrip");
    const pricePerMile = await this.policyInteractor.getPriceForPeriod(period);
    const miles = distance / 1.6;
    this.logger.debug({ pricePerMile, miles }, "calculating");
    return Math.round(pricePerMile * miles);
  }
}
