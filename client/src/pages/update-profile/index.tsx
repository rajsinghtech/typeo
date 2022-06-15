import React, { useState } from "react";
import ReactGA from "react-ga";
import { Grid } from "@mui/material";
import UpdateProfileComponent from "../../components/profile/update-profile";

export default function UpdateProfile() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Update Profile Page Visited",
    });
  }, []);
  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <UpdateProfileComponent />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
