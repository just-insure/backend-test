import { Interval } from "luxon";
import { Logger } from "pino";

export class PolicyInteractor {
  private logger: Logger;

  constructor(_analyticsContext: any, logger: Logger, _userId: number) {
    this.logger = logger.child({ service: "trip" });
  }

  public async getPriceForPeriod(period: Interval) {
    this.logger.info(
      { period },
      "Would really look up policies within period and return lowest price"
    );

    return 12; // 12 cents / mile
  }
}
