import Axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import * as TE from "fp-ts/TaskEither";
import { AxiosError } from "axios";
import * as Option from "fp-ts/Option";
import { pipe } from "fp-ts/pipeable";
import { HttpError } from "./httpError";
import { HttpStatusCode } from "./http.types";

const axiosCodeToHttpStatusCode = (code: number | undefined): HttpStatusCode | undefined => {
  return pipe(
    Option.fromNullable(code),
    Option.fold(
      () => undefined,
      c => c as HttpStatusCode,
    ),
  );
};

export const castToAxiosError = <R = unknown>(e: unknown) => e as AxiosError<R>;

export const axiosErrorToHttpError = <E>(axiosError: AxiosError) => {
  return new HttpError<E>(
    axiosError.message,
    axiosCodeToHttpStatusCode(axiosError.response?.status),
    axiosError.response?.data,
  );
};

export type HttpResult<T, E> = TE.TaskEither<HttpError<E>, T>;

const API_BASE_URL = "/api/v1";

export class HttpService {
  private readonly instance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.instance = Axios.create({
      ...config,
      baseURL: API_BASE_URL,
    });
  }

  public setHeader = (name: string, value?: string) => {
    this.instance.defaults.headers.common[name] = value || "";
  };

  public request<T, E = unknown>(config: AxiosRequestConfig): HttpResult<AxiosResponse<T>, E> {
    return this.makeTaskEither<T, E>(this.instance.request, config);
  }

  public get<T, E = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): HttpResult<AxiosResponse<T>, E> {
    return this.makeTaskEither<T, E>(this.instance.get, url, config);
  }

  public delete<T, E = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): HttpResult<AxiosResponse<T>, E> {
    return this.makeTaskEither<T, E>(this.instance.delete, url, config);
  }

  public head<T, E = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): HttpResult<AxiosResponse<T>, E> {
    return this.makeTaskEither<T, E>(this.instance.head, url, config);
  }

  public post<T, E = unknown>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): HttpResult<AxiosResponse<T>, E> {
    return this.makeTaskEither<T, E>(this.instance.post, url, data, config);
  }

  public put<T, E = unknown>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): HttpResult<AxiosResponse<T>, E> {
    return this.makeTaskEither<T, E>(this.instance.put, url, data, config);
  }

  public patch<T, E = unknown>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): HttpResult<AxiosResponse<T>, E> {
    return this.makeTaskEither<T, E>(this.instance.patch, url, data, config);
  }

  get axiosRef(): AxiosInstance {
    return this.instance;
  }

  private makeTaskEither<T, E>(
    axios: (...args: any[]) => AxiosPromise<T>,
    ...args: any[]
  ): HttpResult<AxiosResponse<T>, E> {
    return TE.tryCatch(
      () => axios(...args),
      e => axiosErrorToHttpError<E>(castToAxiosError<E>(e)),
    );
  }
}
