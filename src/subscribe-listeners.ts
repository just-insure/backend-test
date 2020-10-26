import { createInteractors } from "./interactors";
import { TripSummary } from "./interactors/trip";
import { get as appContext } from "./services/app-context";
import { subscribe } from "./services/gcp-pubsub";

export const subscribeListeners = () => {
  subscribe<TripSummary, { idempotencyId: string }>(
    "tripCompleted",
    ({ type, data, attributes }) => {
      appContext()?.logger.trace({ type }, "Received trip completed");

      const { userId, ...trip } = data;
      const { correlationId, idempotencyId } = attributes;

      const { tripInteractor } = createInteractors(userId, correlationId);
      tripInteractor.createTrip(idempotencyId, trip);
    }
  );
};
