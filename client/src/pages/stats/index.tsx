import React from "react";
import ReactGA from "react-ga";
import { Line } from "react-chartjs-2";
import { RaceSchema } from "constants/schemas/race";
import {
  DefaultStatFilters,
  StatFilters,
  StatsStructure,
  Timeframes,
} from "constants/stats";
import { useAuth } from "contexts/AuthContext";
import StatKeyboard from "components/stats/stat-keyboard";
import MissedSequences from "components/stats/missed-sequences";
import { useStats } from "contexts/StatsContext";
import {
  Chart as ChartJS,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getMultiSelectUpdate, GridCard } from "components/common";
import Filters from "pages/stats/components/filters";
import StatCard from "pages/stats/components/stat-card";
import { GameTypeNames, GameTypes, TextTypeNames } from "constants/settings";
import { SelectChangeEvent } from "@mui/material/Select";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import InsightsIcon from "@mui/icons-material/Insights";
import ModeStandbyIcon from "@mui/icons-material/ModeStandby";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Grid, Box, useTheme, Theme, Typography } from "@mui/material";

ChartJS.register(TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

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

  const { isLoggedIn } = useAuth();
  const theme = useTheme();

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

  if (!isLoggedIn)
    return (
      <>
        <Box sx={{ textAlign: "center", width: "100%", mt: 20 }}>
          <Typography variant="h2" color="secondary">
            You must be logged in to see stats
          </Typography>
          <Typography variant="h2" color="warning.main" mt={5}>
            Guest Stats Coming Soon
          </Typography>
        </Box>
      </>
    );

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
          <GridCard>
            <Box display="flex" justifyContent="flex-start" gap={2}>
              <TimelineIcon color="secondary" />
              <Typography variant="subtitle1">Past Results</Typography>
            </Box>
            <Line
              style={{ maxHeight: 350 }}
              data={generateGraphDataFromRaces(races, statFilters, theme)}
              options={{
                scales: {
                  xAxes: {
                    type: "time",
                    ticks: {
                      maxTicksLimit: 30,
                    },
                  },
                  yAxes: {
                    ticks: {
                      maxTicksLimit: 20,
                    },
                  },
                },
              }}
            />
          </GridCard>
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

const generateGraphDataFromRaces = (
  races: Array<RaceSchema>,
  statFilters: StatFilters,
  theme: Theme
) => {
  const filteredRaces = races.slice(-statFilters.timeframe).filter((race) => {
    return (
      race.wpm > 3 &&
      statFilters.gameMode.includes(
        GameTypeNames.indexOf(race.testType.name)
      ) &&
      statFilters.textType.includes(
        TextTypeNames.indexOf(race.testType.textType)
      )
    );
  });

  const graphData = {
    labels: filteredRaces.map((race) => race.timestamp.toMillis()),

    datasets: [
      {
        label: "WPM",
        data: filteredRaces.map((race) => race.wpm),
        fill: true,
        borderColor: theme.palette.primary.main,
        tension: 0.1,
      },
      {
        label: "Accuracy",
        data: filteredRaces.map((race) => race.accuracy),
        fill: true,
        borderColor: theme.palette.secondary.main,
        tension: 0.1,
      },
    ],
  };

  return graphData;
};
