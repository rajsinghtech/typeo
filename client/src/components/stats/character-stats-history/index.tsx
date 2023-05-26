import React from "react";
import {
  Chart as ChartJS,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { GridCard } from "components/common";
import { CharacterStatsHistory } from "constants/stats";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Box, Typography, useTheme, Theme } from "@mui/material";

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CharacterStatsHistoryProps {
  history: CharacterStatsHistory[];
  keyboardKey: string;
}

export default function CharacterStatsHistoryGraph({
  history,
  keyboardKey,
}: CharacterStatsHistoryProps) {
  const theme = useTheme();
  return (
    <GridCard sx={{ backgroundColor: "background.default" }}>
      <Box display="flex" justifyContent="flex-start" gap={2}>
        <TimelineIcon color="secondary" />
        <Typography variant="subtitle1">History</Typography>
      </Box>
      <Chart
        style={{ maxHeight: 350 }}
        type="line"
        //@ts-expect-error - Chart.js types are wrong
        data={generateGraphDataFromHistory(history, keyboardKey, theme)}
        options={{
          scales: {
            xAxes: {
              ticks: {
                maxTicksLimit: 10,
                maxRotation: 45,
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

const generateGraphDataFromHistory = (
  history: CharacterStatsHistory[],
  keyboardKey: string,
  theme: Theme
) => {
  if (history.length === 0) return { labels: [], datasets: [] };

  const historyWithKey = history.filter(
    ({ stats }) => stats.get(keyboardKey)?.wpm
  );

  const graphData = {
    labels: historyWithKey.map((race) =>
      race.timestamp.toDate().toLocaleDateString("en-US")
    ),

    datasets: [
      {
        type: "line",
        label: " WPM ",
        data: historyWithKey.map(
          ({ stats }) => stats.get(keyboardKey)?.wpm || 0
        ),
        fill: true,
        pointRadius: 0,
        borderColor: theme.palette.primary.main,
        tension: 0.5,
      },
      //   {
      //     type: "line",
      //     label: " Accuracy ",
      //     data: history.map(({stats}) => stats.get(keyboardKey)?. || 0),
      //     fill: true,
      //     borderColor: theme.palette.secondary.main,
      //     tension: 0.1,
      //   },
    ],
  };

  return graphData;
};
