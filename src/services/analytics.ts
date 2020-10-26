import { Logger } from "pino";

interface AnalyticsTrack {
  event: string;
  properties: { [key: string]: string | number };
}

export class Analytics {
  private logger: Logger;

  constructor(logger: Logger, context: { [key: string]: string | number }) {
    this.logger = logger.child({ ...context, service: "trip" });
  }

  public async track({ event, properties }: AnalyticsTrack) {
    this.logger.info(
      { event, properties },
      "Would really call analytics service here"
    );
  }
}
