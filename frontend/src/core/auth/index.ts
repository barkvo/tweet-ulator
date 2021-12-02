import { pipe } from "fp-ts/pipeable";
import * as TE from "fp-ts/TaskEither";
import { HttpService, HttpStatusCode } from "../http";
import { AuthStore } from "./auth.store";
import { AccessToken, AuthStoreInterface, AuthModule, User, Login, Logout } from "./auth.types";
import { AuthorizedOnly, UnauthorizedOnly } from "./RequireAuth.view";

const setAuthHeader = ({ httpService, value }: { httpService: HttpService; value?: string }) => {
  httpService.setHeader("Authorization", value && `Bearer ${value}`);
}

const getLogin = ({ authStore, httpService }: { authStore: AuthStoreInterface; httpService: HttpService; }): Login => (name: string) => {
  return pipe(
    httpService.post<{ code: HttpStatusCode; user: User; token: AccessToken }>('auth/login', {
      name,
    }),
    TE.chain(({ data }) => {
      authStore.setUser(data.user);
      setAuthHeader({ httpService, value: data.token });
      return TE.right(void 0);
    }),
  );
};

const getLogout = ({ authStore, httpService }: { authStore: AuthStoreInterface; httpService: HttpService; }): Logout => () => {
  authStore.setUser();
  setAuthHeader({ httpService });
};

export const buildModule = ({ httpService }: { httpService: HttpService }): AuthModule => {
  const authStore = new AuthStore();
  return {
    authStore,
    login: getLogin({ authStore, httpService }),
    logout: getLogout({ authStore, httpService }),
    AuthorizedOnly,
    UnauthorizedOnly,
  };
};

export * from "./auth.types";
