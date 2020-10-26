import { get as appContext } from "./app-context";
import { EventEmitter } from "events";

type EventHandler<T extends object, U extends Attributes> = (
  incoming: PubSubMessage<T, U>
) => void;

type Attributes = { [key: string]: string };

interface PubSubMessage<T extends object, U extends Attributes> {
  type: string;
  data: T & { userId: number };
  attributes: U & { correlationId: string };
}

// We're not really going to subscribe to GCP here in this example
const emitter = new EventEmitter();
export const subscribe = <T extends object, U extends Attributes>(
  topic: string,
  handler: EventHandler<T, U>
) => {
  appContext()?.logger.info({ topic }, "Subscribing to pubsub");

  emitter.addListener(topic, handler);
};
