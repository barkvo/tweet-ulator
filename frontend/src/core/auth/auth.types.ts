import * as TE from "fp-ts/TaskEither";

export type UserId = string & { readonly type: unique symbol };

export interface User {
  id: UserId;
  name: string;
  createdAt: number;
}

export type AccessToken = string & { readonly type: unique symbol };

export type Login = (name: string) => TE.TaskEither<Error, void>;

export type Logout = () => void;

export type AuthorizedOnly = (i: { children: JSX.Element }) => JSX.Element;

export type UnauthorizedOnly = (i: { children: JSX.Element }) => JSX.Element;

export interface AuthStore {
  isAuthenticated: boolean;
  user?: User;
  setUser: (value?: User) => void;
}

export interface AuthModule {
  authStore: AuthStore;
  login: Login;
  logout: Logout;
  AuthorizedOnly: AuthorizedOnly;
  UnauthorizedOnly: UnauthorizedOnly;
}
