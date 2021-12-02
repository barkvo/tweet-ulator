import { Spin, Space } from "antd";
import { observer } from "mobx-react";
import React, { FC, useEffect, useState } from "react";
import type { RouteObject } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { AuthModule, buildModule as buildAuthModule } from "./core/auth";
import { buildModule as buildHttpModule, HttpService } from "./core/http";
import { Auth, Layout, NotFound, Private } from "./modules/main";
import { PostsModule, buildModule as buildPostsModule } from "./modules/posts";
import './App.css';

const Navigation: FC<{ authModule: AuthModule, postsModule: PostsModule }> = observer(({ authModule, postsModule }) => {
  const { AuthorizedOnly, UnauthorizedOnly, login, logout, authStore } = authModule;
  const {
    Posts,
    loadPostsInitial,
    loadMorePosts,
    loadReplyPosts,
    createPost,
    createReplyPost,
    postsStore,
  } = postsModule;
  const routes: RouteObject[] = [
    {
      path: "/",
      element: <Layout/>,
      children: [
        { index: true, element: <UnauthorizedOnly isAuthenticated={authStore.isAuthenticated}><Auth login={login}/></UnauthorizedOnly> },
        {
          path: "/private",
          element: 
            <AuthorizedOnly isAuthenticated={authStore.isAuthenticated} >
              <Private logout={logout} />
            </AuthorizedOnly>,
          children: [
            {
              index: true, 
              element:
                <Posts
                  loadPostsInitial={loadPostsInitial}
                  loadMorePosts={loadMorePosts}
                  loadReplyPosts={loadReplyPosts}
                  createPost={createPost}
                  createReplyPost={createReplyPost}
                  canLoadMoreMainPosts={postsStore.canLoadMoreMainPosts}
                  postsTree={postsStore.postsTree}
                  remainingMainPostsToLoadAmount={postsStore.remainingMainPostsToLoadAmount}
                />
            }
          ]
        },
        { path: "*", element: <NotFound /> }
      ]
    }
  ];
  return useRoutes(routes);
});

interface AppState {
  authModule?: AuthModule;
  httpService?: HttpService; 
  postsModule?: PostsModule;
}

const App: FC = () => {
  const [state, setState] = useState<AppState>({});
  useEffect(() => {
    const { httpService } = buildHttpModule();
    const authModule = buildAuthModule({ httpService });
    const postsModule = buildPostsModule({ httpService });
    setState({
      authModule,
      httpService,
      postsModule,
    });
  }, []);
  if (!state.authModule || !state.postsModule) {
    return (
      <Space size="middle">
        <Spin size="large" />
      </Space>
    );
  }
  return <Navigation authModule={state.authModule} postsModule={state.postsModule}/>;
};

export default App;