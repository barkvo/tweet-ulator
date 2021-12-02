import { observer } from "mobx-react";
import { Navigate } from "react-router-dom";
import { AuthorizedOnlyInterface, UnauthorizedOnlyInterface } from "./auth.types";

export const AuthorizedOnly: AuthorizedOnlyInterface = observer(
  ({ children, isAuthenticated }) => {
    if (!isAuthenticated) {
      return <Navigate to="/"/>;
    }
    return (
      <div>
        {isAuthenticated && children}
      </div>
    );
  }
);

export const UnauthorizedOnly: UnauthorizedOnlyInterface = observer(
  ({ children, isAuthenticated }) => {
    if (isAuthenticated) {
      return <Navigate to="/private"/>;
    }
    return children;
  }
);
