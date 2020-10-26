import { Logger } from "pino";
import { Analytics } from "../services/analytics";

export class BalanceInteractor {
  private userId: number;
  private logger: Logger;
  private analytics: Analytics;

  constructor(analyticsContext: any, logger: Logger, userId: number) {
    this.logger = logger.child({ service: "trip" });
    this.userId = userId;

    this.analytics = new Analytics(this.logger, analyticsContext);
  }

  public async charge(amount: number) {
    this.logger.info(
      { amount },
      "Would really discount amount from their balance here and return transaction id"
    );

    this.analytics.track({
      event: "chargedUser",
      properties: { userId: this.userId, amount },
    });

    return 1;
  }
}
