import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";

interface PrivateRouteProps {
  component: () => JSX.Element;
  [x: string]: unknown;
}

export default function PrivateRoute({
  component: Component,
  ...rest
}: PrivateRouteProps) {
  const { isLoggedIn } = useAuth();
  return (
    <Route
      {...rest}
      render={() => {
        return isLoggedIn ? <Component /> : <Redirect to="/login" />;
      }}
    ></Route>
  );
}
