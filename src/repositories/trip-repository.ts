import { Logger } from "pino";
import { getRepository } from "typeorm";
import { Maybe } from "../lib/maybe";
import { CompletedTrip as CompletedTripOrm } from "../models/completed-trip";

export interface CompletedTrip {
  id: string;
  start: Date;
  end: Date;
  distance: number;
  cost: number;
  duration: string;
  transactionId: number;
  tripDataUrl: string;
}

interface PagingOptions {
  take: number;
  skip: number;
  orderBy: string;
  orderDir: "ASC" | "DESC";
  search?: string;
}

interface PartialResults {
  results: CompletedTrip[];
  total: number;
}

export interface CompletedTripRepository {
  insert(trip: CompletedTrip): Promise<Maybe<CompletedTrip>>;
  getAll(pagingOptions: PagingOptions): Promise<PartialResults>;
  getBy(search: Partial<CompletedTrip>): Promise<Maybe<CompletedTrip>>;
}

export class CompletedTripDataSource implements CompletedTripRepository {
  private userId: number;
  private logger: Logger;

  constructor(userId: number, logger: Logger) {
    this.logger = logger.child({ repository: "completed-trip" });
    this.userId = userId;
  }

  public async insert(trip: CompletedTrip) {
    try {
      const entity = { userId: this.userId as any, ...trip };

      const saved = await CompletedTripOrm.create(entity).save();

      return this.serialise(saved);
    } catch (error) {
      // We are idempotent and so could be requested to create twice for the same trip
      if (error.code && error.code === "23505") {
        this.logger.info({ id: trip.id }, error.message);
      } else {
        throw error;
      }
    }
  }

  public async getAll(pagingOptions: PagingOptions) {
    const { orderBy, orderDir, take, skip, search } = pagingOptions;

    const query = getRepository(CompletedTripOrm)
      .createQueryBuilder("completed_trip")
      .orderBy(`"${orderBy}"`, orderDir, "NULLS LAST")
      .limit(take)
      .offset(skip * take);

    if (search) {
      query.where('completed_trip."id" ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [result, total] = await query.getManyAndCount();

    const serialised = result.map(this.serialise);

    return {
      results: serialised,
      total,
    };
  }

  public async getBy(search: Partial<CompletedTrip>) {
    const trip = await CompletedTripOrm.findOne({
      where: { userId: this.userId as any, ...search },
    });

    return trip ? this.serialise(trip) : undefined;
  }

  private serialise(entity: CompletedTripOrm): CompletedTrip {
    return {
      id: entity.id,
      start: entity.start,
      end: entity.end,
      distance: entity.distance,
      cost: entity.cost,
      duration: entity.duration,
      transactionId: entity.transactionId,
      tripDataUrl: entity.tripDataUrl,
    };
  }
}
