import React from "react";
import ReactGA from "react-ga";
import {
  DefaultStatFilters,
  StatFilters,
  StatsStructure,
} from "constants/stats";
import StatKeyboard from "components/stats/stat-keyboard";
import MissedSequences from "components/stats/missed-sequences";
import { useStats } from "contexts/StatsContext";
import { getMultiSelectUpdate, GridCard } from "components/common";
import Filters from "pages/stats/components/filters";
import StatCard from "pages/stats/components/stat-card";
import { GameTypeNames, TextTypeNames } from "constants/settings";
import { SelectChangeEvent } from "@mui/material/Select";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import InsightsIcon from "@mui/icons-material/Insights";
import ModeStandbyIcon from "@mui/icons-material/ModeStandby";
import { Grid, Box } from "@mui/material";
import RaceHistory from "components/stats/race-history";

export default function Stats() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Stats Page Visited",
    });
  }, []);
  return (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <StatsComponent />
        </Grid>
      </Grid>
    </>
  );
}

function StatsComponent() {
  const [statFilters, setStatFilters] =
    React.useState<StatFilters>(DefaultStatFilters);

  const [baseStats, setBaseStats] = React.useState<StatsStructure>({
    averages: {
      wpm: 0,
      accuracy: 0,
    },
    best: {
      wpm: 0,
      accuracy: 0,
    },
  });

  const { races, getBaseStats } = useStats();

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    const newTimeframe = parseInt(event.target.value);
    setStatFilters((prevStatFilters) => {
      return { ...prevStatFilters, timeframe: newTimeframe };
    });
  };

  const handleGameModeChange = (event: SelectChangeEvent) => {
    const changeValue: string | string[] = event.target.value;
    const newGameMode = getMultiSelectUpdate(
      changeValue,
      GameTypeNames.slice(0, GameTypeNames.length - 1)
    );

    setStatFilters((prevStatFilters) => {
      return { ...prevStatFilters, gameMode: newGameMode };
    });
  };

  const handleTextTypeChange = (event: SelectChangeEvent) => {
    const changeValue: string | string[] = event.target.value;
    const newTextType = getMultiSelectUpdate(changeValue, TextTypeNames);

    setStatFilters((prevStatFilters) => {
      return { ...prevStatFilters, textType: newTextType };
    });
  };

  React.useEffect(() => {
    setBaseStats(getBaseStats(statFilters));
  }, [statFilters, getBaseStats]);

  // if (!isLoggedIn)
  //   return (
  //     <>
  //       <Box sx={{ textAlign: "center", width: "100%", mt: 20 }}>
  //         <Typography variant="h2" color="secondary">
  //           You must be logged in to see stats
  //         </Typography>
  //         <Typography variant="h2" color="warning.main" mt={5}>
  //           Guest Stats Coming Soon
  //         </Typography>
  //       </Box>
  //     </>
  //   );

  return (
    <>
      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12}>
          <GridCard
            sx={{
              display: { xs: "block", lg: "none" },
              width: "fit-content",
              margin: "auto",
            }}
          >
            <Filters
              statFilters={statFilters}
              handleTimeframeChange={handleTimeframeChange}
              handleGameModeChange={handleGameModeChange}
              handleTextTypeChange={handleTextTypeChange}
            />
          </GridCard>
        </Grid>
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent={{ xs: "center", lg: "space-between" }}
            alignItems="flex-end"
            gap={3}
          >
            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent={{ xs: "center", sm: "flex-start" }}
              gap={3}
            >
              <StatCard
                title={"Best WPM"}
                stat={baseStats.best.wpm}
                icon={<WorkspacePremiumIcon color="warning" />}
              />
              <StatCard
                title={"Average WPM"}
                stat={baseStats.averages.wpm}
                icon={<InsightsIcon color="success" />}
              />
              <StatCard
                title={"Accuracy"}
                stat={baseStats.averages.accuracy}
                icon={<ModeStandbyIcon color="error" />}
              />
            </Box>
            <GridCard sx={{ display: { xs: "none", lg: "block" } }}>
              <Filters
                statFilters={statFilters}
                handleTimeframeChange={handleTimeframeChange}
                handleGameModeChange={handleGameModeChange}
                handleTextTypeChange={handleTextTypeChange}
              />
            </GridCard>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <RaceHistory races={races} statFilters={statFilters} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MissedSequences filters={statFilters} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatKeyboard title="Key Speed" filters={statFilters} />
        </Grid>
      </Grid>
    </>
  );
}
