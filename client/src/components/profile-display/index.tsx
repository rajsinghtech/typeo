import React from "react";
import { DefaultStatFilters } from "constants/stats";
import { useAuth } from "contexts/AuthContext";
import { useStats } from "contexts/StatsContext";
import { GridCard } from "components/common";
import {
  Box,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export function HomeProfile() {
  const { currentUser, isLoggedIn } = useAuth();

  const { getBaseStats } = useStats();

  const baseStats = getBaseStats(DefaultStatFilters);

  const theme = useTheme();
  const smScreenSize = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      {smScreenSize ? (
        <GridCard padding="10px">
          <Box display="flex" gap={1}>
            <Typography color="primary.main">
              {currentUser.displayName?.toUpperCase() || ""}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography>{"Average"}</Typography>
            <Typography color="secondary.main">
              {baseStats.averages.wpm.toFixed(1)}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography>{"Best"}</Typography>
            <Typography color="secondary.main">
              {baseStats.best.wpm.toFixed(1)}
            </Typography>
          </Box>
        </GridCard>
      ) : (
        <HomeProfileMobile />
      )}
    </>
  );
}

export const HomeProfileMobile = React.memo(
  function HomeProfileMobileComponent() {
    const { currentUser, isLoggedIn } = useAuth();

    return (
      <GridCard padding="10px">
        <Typography color="primary.main">
          {currentUser.displayName?.toUpperCase() || ""}
        </Typography>
      </GridCard>
    );
  }
);
