import { get as appContext } from "../services/app-context";
import { TripInteractor } from "./trip";
import { BalanceInteractor } from "./balance";
import { PolicyInteractor } from "./policy";

export const createInteractors = (userId: number, correlationId: string) => {
  const logger = appContext()?.logger.child({ correlationId, userId });
  if (!logger) {
    throw new Error("logger not initialised");
  }
  const analyticsContext = { userId, correlationId };

  const balanceInteractor = new BalanceInteractor(
    analyticsContext,
    logger,
    userId
  );

  const policyInteractor = new PolicyInteractor(
    analyticsContext,
    logger,
    userId
  );

  const tripInteractor = new TripInteractor(
    analyticsContext,
    logger,
    balanceInteractor,
    policyInteractor,
    userId
  );

  return {
    balanceInteractor,
    policyInteractor,
    tripInteractor,
  };
};
