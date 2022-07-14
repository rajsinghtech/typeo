import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

interface PublicRouteProps {
  component: () => JSX.Element;
  // TODO:  Add proper type for this
  [x: string]: unknown;
}

export default function PublicRoute({
  component: Component,
  ...rest
}: PublicRouteProps) {
  const { isLoggedIn } = useAuth();
  return (
    <Route
      {...rest}
      render={() => {
        return isLoggedIn ? <Redirect to="/" /> : <Component />;
      }}
    ></Route>
  );
}
