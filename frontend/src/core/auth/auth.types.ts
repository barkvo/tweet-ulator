import * as TE from "fp-ts/TaskEither";
import { FC } from "react";

export type UserId = string & { readonly type: unique symbol };

export interface User {
  id: UserId;
  name: string;
  createdAt: number;
}

export type AccessToken = string & { readonly type: unique symbol };

export type Login = (name: string) => TE.TaskEither<Error, void>;

export type Logout = () => void;

export type AuthorizedOnlyInterface = FC<{ children: JSX.Element; isAuthenticated: boolean; }>;

export type UnauthorizedOnlyInterface = FC<{ children: JSX.Element; isAuthenticated: boolean; }>;

export interface AuthStoreInterface {
  isAuthenticated: boolean;
  user?: User;
  setUser: (value?: User) => void;
}

export interface AuthModule {
  authStore: AuthStoreInterface;
  login: Login;
  logout: Logout;
  AuthorizedOnly: AuthorizedOnlyInterface;
  UnauthorizedOnly: UnauthorizedOnlyInterface;
}
