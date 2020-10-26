interface UpstreamErrorDetails {
  message: string;
  code?: string;
  req: {
    baseUrl?: string;
    path?: string;
    method?: string;
  };
  res: {
    status?: number;
    statusText?: string;
    headers?: { [key: string]: string };
    data?: any;
  };
}

export class HttpClientError extends Error {
  code: string = "upstream";
  originalError?: Error;
  statusCode: number;
  upstreamDetails: UpstreamErrorDetails;

  constructor(
    message: string,
    statusCode: number,
    upstreamDetails: UpstreamErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, HttpClientError);

    this.statusCode = statusCode;
    this.upstreamDetails = upstreamDetails;
  }

  toJSON() {
    const {
      originalError: err,
      message: msg,
      code: errCode,
      stack,
      upstreamDetails,
    } = this;
    return { err, msg, errCode, stack, upstreamDetails };
  }

  shouldSuppressInResponse() {
    return this.code ? this.code === "upstream" : false;
  }
}
