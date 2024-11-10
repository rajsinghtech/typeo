import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Pages from "pages";
import Nav from "components/navigation";
import PrivateRoute from "components/PrivateRoute";
import PublicRoute from "components/PublicRoute";

const Router = () => {
  return (
    <BrowserRouter>
      <Nav>
        <Switch>
          <Route exact path="/" component={Pages.Home} />
          {/* <Route exact path="/online" component={Pages.Online} /> */}
          <Route exact path="/stats" component={Pages.Stats} />
          <PrivateRoute
            exact
            path="/update-profile"
            component={Pages.UpdateProfile}
          />
          {/* <PrivateRoute exact path="/inbox" component={Pages.Inbox} /> */}
          <Route exact path="/signup" component={Pages.Signup} />
          <PublicRoute exact path="/login" component={Pages.Login} />
          <Route
            exact
            path="/forgot-password"
            component={Pages.ForgotPassword}
          />
          <Route exact path="/improvement" component={Pages.Improve} />
          <Route exact path="/multiplayer" component={Pages.Multiplayer} />
          <Route exact path="/multiplayer/ffa" component={Pages.FFA} />
          <Route
            exact
            path="/multiplayer/private/:matchId"
            component={Pages.PrivateMatch}
          />
        </Switch>
      </Nav>
    </BrowserRouter>
  );
};

export default Router;
