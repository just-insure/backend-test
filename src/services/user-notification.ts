import { get as appContext } from "./app-context";

export const userNotificationTrip = (
  distance: number,
  cost: number,
  userId: number
) => {
  appContext()?.logger.info(
    { distance, cost, userId },
    "Would usually invoke GCP / Firebase to send notification to user phone"
  );
};
