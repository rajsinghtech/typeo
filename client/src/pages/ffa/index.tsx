import React /*, { useState}*/ from "react";
import ReactGA from "react-ga";
// import { useHistory } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
import FFAGame from "components/multiplayer/ffa-game";
import Grid from "@mui/material/Grid";

export default function FFA() {
  /* const { currentUser, logout } = useAuth();
  const [test, setTest] = useState<string>("");
  const history = useHistory();
  */

  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "FFA Page Visited",
    });
  }, []);

  return (
    <Grid container spacing={3}>
      {/* <Grid item xs={2}></Grid> */}
      <Grid item xs={12}>
        <FFAGame />
      </Grid>
      {/* <Grid item xs={2}></Grid> */}
    </Grid>
  );
}
