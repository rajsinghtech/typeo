import { Divider, Typography } from "@mui/material";
import React from "react";
import { Timeframes } from "../../../constants/stats";
import { useAuth } from "../../../contexts/AuthContext";
import { useStats } from "../../../contexts/StatsContext";
import { GridCard } from "../../common";

export default function HomeProfile() {
  const { isLoggedIn } = useAuth();

  const { getBaseStats } = useStats();


  const baseStats = getBaseStats(Timeframes.LAST_100);

  return (
    <GridCard accent>
      <Divider sx={{ my: 1 }} />
      {isLoggedIn ? (
        <>
          <Typography my={1}>{"Average WPM"}</Typography>
          <Typography color="secondary.main">
            {baseStats.averages.wpm.toFixed(1)}
          </Typography>
          <Typography my={1}>{"Best WPM"}</Typography>
          <Typography color="secondary.main">
            {baseStats.best.wpm.toFixed(1)}
          </Typography>
        </>
      ) : (
        <Typography>Login for stats</Typography>
      )}
    </GridCard>
  );
}
