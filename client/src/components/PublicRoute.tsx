import React from "react";
import { Redirect, Route, RouteComponentProps } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface PublicRouteProps {
  component: () => JSX.Element;
  [x: string]: any;
}

export default function PublicRoute({
  component: Component,
  ...rest
}: PublicRouteProps) {
  const { isLoggedIn } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) => {
        return isLoggedIn ? <Redirect to="/" /> : <Component />;
      }}
    ></Route>
  );
}
