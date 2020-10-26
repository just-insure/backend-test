import axios, { AxiosError, Method } from "axios";
import { Logger } from "pino";
import { get as appContext } from "../app-context";
import { HttpClientError } from "./http-client-error";

interface RequestOptions {
  logger?: Logger;
  headers?: { [key: string]: string };
  timeout?: number;
}

interface AxiosOptionsSubset extends RequestOptions {
  url: string;
  method: Method;
  data?: object;
}

const makeAxiosRequest = async <T>(options: AxiosOptionsSubset): Promise<T> => {
  const { logger = appContext()?.logger, ...axiosOptions } = options;
  if (!logger) {
    throw new Error("No logger configured");
  }
  const clientLogger = logger.child({
    module: "http-client",
    url: options.url,
  });

  try {
    clientLogger.debug(
      { headers: axiosOptions.headers, timeout: axiosOptions.timeout },
      "Sending http request"
    );

    const response = await axios.request<T>(axiosOptions);

    clientLogger.debug(
      {
        status: response?.status,
        statusText: response?.statusText,
        headers: response?.headers,
      },
      "Received http response"
    );

    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    throw new HttpClientError("Call to external API failed", 503, {
      message: axiosError.message,
      code: axiosError?.code,
      req: {
        baseUrl: axiosError?.request?.baseUrl,
        path: axiosError?.request?.path,
        method: axiosError?.request?.method,
      },
      res: {
        headers: axiosError?.response?.headers,
        status: axiosError?.response?.status,
        statusText: axiosError?.response?.statusText,
        data: axiosError?.response?.data,
      },
    });
  }
};

const axiosRequestor = (method: Method) => async <T = any>(
  url: string,
  data?: object,
  config: RequestOptions = {}
) => makeAxiosRequest<T>({ method, url, data, ...config });

export default {
  get: axiosRequestor("GET"),
  post: axiosRequestor("POST"),
  put: axiosRequestor("PUT"),
  patch: axiosRequestor("PATCH"),
  delete: axiosRequestor("DELETE"),
};
