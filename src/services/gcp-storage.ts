import { get as appContext } from "./app-context";

export const readJson = async <T>(location: string): Promise<T> => {
  appContext()?.logger.info(
    { location },
    "Would usually call out to GCP and get data from bucket"
  );

  return {} as T;
};
