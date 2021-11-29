import { observer } from "mobx-react";
import { Navigate } from "react-router-dom";
import { AuthStore, AuthorizedOnly, UnauthorizedOnly } from "./auth.types";

export const getAuthorizedOnly = (authStore: AuthStore): AuthorizedOnly => observer(
  ({ children }: { children: JSX.Element }) => {
    if (!authStore.isAuthenticated) {
      return <Navigate to="/"/>;
    }
    return children;
  }
);

export const getUnauthorizedOnly = (authStore: AuthStore): UnauthorizedOnly => observer(
  ({ children }: { children: JSX.Element }) => {
    if (authStore.isAuthenticated) {
      return <Navigate to="/private"/>;
    }
    return children;
  }
);
