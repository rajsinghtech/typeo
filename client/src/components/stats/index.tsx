import React from "react";
import StatSection from "./components/StatSection";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Box,
  useTheme,
  Theme,
  Typography,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Line } from "react-chartjs-2";
import { RaceSchema } from "../../constants/schemas/race";
import {
  Chart as ChartJS,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {  StatsStructure, Timeframes } from "../../constants/stats";
import { useAuth } from "../../contexts/AuthContext";
import StatKeyboard from "./components/StatKeyboard";
import MissedSequences from "./components/MissedSequences";
import { useStats } from "../../contexts/StatsContext";

ChartJS.register(TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MainStats() {
  const [statTimeframe, setStatTimeframe] = React.useState<number>(
    Timeframes.LAST_100
  );
  const [graphTimeframe, setGraphTimeframe] = React.useState<number>(
    Timeframes.LAST_100
  );

  const [baseStats, setBaseStats] = React.useState<StatsStructure>({
    averages: {
      wpm: 0,
      accuracy: 0,
      mostMissedCharacter: "None",
    },
    best: {
      wpm: 0,
      accuracy: 0,
    },
  });

  const { races, getBaseStats } = useStats();

  const { isLoggedIn } = useAuth();
  const theme = useTheme();

  const handleStatTimeframeChange = (event: SelectChangeEvent) => {
    const newTimeframe = parseInt(event.target.value);
    setStatTimeframe(newTimeframe);
    setBaseStats(getBaseStats(newTimeframe));
  };

  const handleGraphTimeframeChange = (event: SelectChangeEvent) => {
    const newTimeframe = parseInt(event.target.value);
    setGraphTimeframe(newTimeframe);
  };

  React.useEffect(() => {
    setBaseStats(getBaseStats(statTimeframe));
  }, [statTimeframe, races]);

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
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <FormControl variant="standard" sx={{ minWidth: 200 }}>
            <InputLabel id="averages-timeframe-label">Timeframe</InputLabel>
            <Select
              label="Timeframe"
              labelId="averages-timeframe-label"
              value={`${statTimeframe}`}
              onChange={handleStatTimeframeChange}
            >
              <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
              <MenuItem value={Timeframes.LAST_100}>Last 100 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
            </Select>
          </FormControl>
          <StatSection title="Averages" data={baseStats?.averages} />
          <StatSection title="Best Race" data={baseStats?.best} />

          <Box my={3}>
            <MissedSequences />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <FormControl variant="standard" sx={{ minWidth: 200 }}>
            <InputLabel id="graph-timeframe-label">Timeframe</InputLabel>
            <Select
              label="Timeframe"
              labelId="graph-timeframe-label"
              value={`${graphTimeframe}`}
              onChange={handleGraphTimeframeChange}
            >
              <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
              <MenuItem value={Timeframes.LAST_100}>Last 100 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
            </Select>
          </FormControl>
          <Line
            style={{ paddingBottom: 20 }}
            data={generateGraphDataFromRaces(races, graphTimeframe, theme)}
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

          <Box my={3}>
            <StatKeyboard title="Key Speed" />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

const generateGraphDataFromRaces = (
  races: Array<RaceSchema>,
  timeframe: number,
  theme: Theme
) => {
  const filteredRaces = races.slice(-timeframe).filter((race) => race.wpm > 3);
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
