import React, { FC, useEffect, useState } from 'react';
import type { RouteObject } from "react-router-dom";
import { Link, useRoutes } from "react-router-dom";
import { AuthModule, buildModule as buildAuthModule } from "./core/auth";
import { buildModule as buildHttpModule, HttpService } from "./core/http";
import { Auth, Layout, NotFound, Private } from "./modules/main";
import { Posts } from "./modules/posts";
import './App.css';

const Navigation: FC<{ authModule: AuthModule }> = ({ authModule }) => {
  const { AuthorizedOnly, UnauthorizedOnly, login, logout, authStore } = authModule;
  const routes: RouteObject[] = [
    {
      path: "/",
      element: <Layout/>,
      children: [
        { index: true, element: <UnauthorizedOnly><Auth login={login}/></UnauthorizedOnly> },
        {
          path: "/private",
          element: <AuthorizedOnly><Private logout={logout}/></AuthorizedOnly>,
          children: [
            { index: true, element: <Posts /> }
          ]
        },
        { path: "*", element: <NotFound /> }
      ]
    }
  ];
  return useRoutes(routes);
};

interface AppState {
  authModule?: AuthModule;
  httpService?: HttpService; 
}

const App: FC = () => {
  const [state, setState] = useState<AppState>({});
  useEffect(() => {
    const { httpService } = buildHttpModule();
    const authModule = buildAuthModule({ httpService });
    setState({
      authModule,
      httpService,
    });
  }, []);
  if (!state.authModule) {
    return (
      <div>
        Not ready
      </div>
    );
  }
  return <Navigation authModule={state.authModule}/>;
};

export default App;