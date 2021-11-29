import { HttpStatusCode, IHttpError } from "./http.types";

export class HttpError<R = unknown> extends Error implements IHttpError<R> {
  constructor(message: string, public code: HttpStatusCode | undefined, public response: R) {
    super(message);

    this.code = code;
    this.response = response;
  }
}

export class BulkHTTPError extends Error {
  constructor(public message: string, public errors: HttpError[] = []) {
    super();
  }
}
