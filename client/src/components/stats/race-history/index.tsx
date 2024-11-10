import React from "react";
import {
  Chart as ChartJS,
  TimeScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { GridCard } from "components/common";
import { RaceSchema } from "constants/schemas/race";
import { GameTypeNames, TextTypeNames } from "constants/settings";
import { StatFilters } from "constants/stats";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Box, Typography, useTheme, Theme } from "@mui/material";

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

interface RaceHistoryProps {
  races: RaceSchema[];
  statFilters: StatFilters;
  timeframe?: number;
}

export default function RaceHistory({
  races,
  statFilters,
  timeframe,
}: RaceHistoryProps) {
  const theme = useTheme();
  return (
    <GridCard>
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Box display="flex" gap={2}>
          <TimelineIcon color="secondary" />
          <Typography variant="subtitle1">History</Typography>
        </Box>
        {timeframe ? (
          <Typography>{`Last ${timeframe} Races`}</Typography>
        ) : (
          <Typography>{`Last ${statFilters.timeframe} Races`}</Typography>
        )}
      </Box>
      <Chart
        style={{ maxHeight: 350 }}
        type="line"
        //@ts-expect-error - Chart.js types are wrong
        data={generateGraphDataFromRaces(races, statFilters, theme)}
        options={{
          scales: {
            xAxes: {
              ticks: {
                maxTicksLimit: 15,
                maxRotation: 20,
                minRotation: 0,
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
  );
}

const findNewAverage = (
  prevAvg: number,
  numElements: number,
  newElement: number
): number => {
  return (prevAvg * numElements + newElement) / (numElements + 1);
};

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

  if (filteredRaces.length === 0) return { labels: [], datasets: [] };

  let currentAverage = 0;
  const averageWpmData: number[] = filteredRaces.map(({ wpm }, index) => {
    const newAverage = findNewAverage(currentAverage, index, wpm);
    currentAverage = newAverage;
    return newAverage;
  });

  const graphData = {
    labels: filteredRaces.map((race) =>
      race.timestamp.toDate().toLocaleDateString("en-US")
    ),

    datasets: [
      {
        type: "line",
        label: " WPM ",
        data: filteredRaces.map((race) => race.wpm),
        fill: true,
        borderColor: theme.palette.primary.main,
        tension: 0.1,
      },
      {
        type: "line",
        label: " Average WPM ",
        data: averageWpmData,
        fill: true,
        borderColor: theme.palette.warning.main,
        tension: 0.85,
        borderDash: [3, 5],
      },
      {
        type: "line",
        label: " Accuracy ",
        data: filteredRaces.map((race) => race.accuracy),
        fill: true,
        borderColor: theme.palette.secondary.main,
        tension: 0.1,
      },
    ],
  };

  return graphData;
};
