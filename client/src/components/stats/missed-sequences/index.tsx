import React from "react";
import { Bar } from "react-chartjs-2";
import { BarChartData } from "constants/graphs";
import { GridCard } from "components/common";
import { useGameSettings } from "contexts/GameSettings";
import { useStats } from "contexts/StatsContext";
import { DefaultStatFilters, StatFilters, Timeframes } from "constants/stats";
import TimeframeSelect from "components/stats/timeframe-select";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CloseIcon from "@mui/icons-material/Close";

import { Box, Button, SelectChangeEvent, Typography } from "@mui/material";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#ababab";

const defaultBackgroundColors = [
  "rgba(255, 50, 70, 0.3)",
  "rgba(255, 159, 64, 0.3)",
  "rgba(255, 205, 86, 0.3)",
  "rgba(75, 192, 192, 0.3)",
  "rgba(54, 162, 235, 0.3)",
  "rgba(153, 102, 255, 0.3)",
  "rgba(201, 203, 207, 0.3)",
  "rgba(255, 50, 70, 0.3)",
  "rgba(255, 159, 64, 0.3)",
  "rgba(255, 205, 86, 0.3)",
  "rgba(75, 192, 192, 0.3)",
  "rgba(54, 162, 235, 0.3)",
  "rgba(153, 102, 255, 0.3)",
  "rgba(201, 203, 207, 0.3)",
  "rgba(255, 50, 70, 0.3)",
  "rgba(255, 159, 64, 0.3)",
  "rgba(255, 205, 86, 0.3)",
  "rgba(75, 192, 192, 0.3)",
  "rgba(54, 162, 235, 0.3)",
  "rgba(153, 102, 255, 0.3)",
];

interface MissedsequencesProps {
  missedSequences?: { [x: string]: number };
  filters?: StatFilters;
  interactive?: boolean;
  noBorder?: boolean;
}

export default function MissedSequences({
  missedSequences,
  filters,
  interactive,
  noBorder,
}: MissedsequencesProps) {
  const [timeframe, setTimeframe] = React.useState<number>(Timeframes.LAST_100);
  const [missedSequenceData, setMissedSequenceData] =
    React.useState<BarChartData>();

  const { gameSettings, setGameSettings } = useGameSettings();

  const { getMissedSequences } = useStats();

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    const newTimeframe = parseInt(event.target.value);
    setTimeframe(newTimeframe);
  };

  const togglePracticeStringsValue = (element: number | string) => {
    if (!missedSequenceData) return;
    const value =
      typeof element === "number"
        ? missedSequenceData.labels[element]
        : element;
    const practiceStrings = gameSettings.gameInfo.practice.practiceStrings;

    const keyIndex = practiceStrings.indexOf(value);
    if (keyIndex === -1) {
      practiceStrings.push(value);
    } else {
      practiceStrings.splice(keyIndex, 1);
    }

    setGameSettings({
      ...gameSettings,
      gameInfo: {
        ...gameSettings.gameInfo,
        practice: { ...gameSettings.gameInfo.practice, practiceStrings },
      },
    });
  };

  React.useEffect(() => {
    // Missed sequences
    const missedSequencesEntries = Object.entries(
      missedSequences ||
        getMissedSequences(filters || { ...DefaultStatFilters, timeframe })
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    const labels = missedSequencesEntries.map((entry) =>
      entry[0].replaceAll(" ", "_")
    );

    setMissedSequenceData({
      labels: labels,
      datasets: [
        {
          data: missedSequencesEntries.map((entry) => entry[1]),
          fill: true,
          backgroundColor: defaultBackgroundColors,
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(153, 102, 255)",
            "rgb(201, 203, 207)",
          ],
          borderWidth: 1,
          maxBarThickness: 100,
        },
      ],
    });
  }, [timeframe, filters, getMissedSequences]);

  return (
    <>
      <GridCard noBorder={noBorder} sx={{ textAlign: "center" }}>
        {interactive ? (
          <Box textAlign="left">
            {gameSettings.gameInfo.practice.practiceStrings
              .filter((val) => val.length > 1)
              .map((val) => (
                <Button
                  key={`${val}_practiceString`}
                  variant="outlined"
                  color="secondary"
                  sx={{ mx: 1, mb: 2, textTransform: "none" }}
                  endIcon={<CloseIcon fontSize="small" />}
                  onClick={() => togglePracticeStringsValue(val)}
                >
                  <Typography>{val}</Typography>
                </Button>
              ))}
          </Box>
        ) : null}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box display="flex" gap={2}>
            <SortByAlphaIcon color="secondary" />
            <Typography variant="subtitle1">Missed Sequences</Typography>
          </Box>

          {/* {!filters ? (
            <TimeframeSelect
              timeframe={timeframe}
              handleTimeframeChange={handleTimeframeChange}
            />
          ) : null} */}
        </Box>
        {missedSequenceData && missedSequenceData.labels.length > 0 ? (
          <Bar
            data={missedSequenceData}
            options={{
              onClick: (event, element) => {
                if (!interactive) return;
                if (element.length > 0 && missedSequenceData) {
                  const elementIndex = element[0].index;

                  togglePracticeStringsValue(elementIndex);
                }
              },
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                yAxes: {
                  ticks: {
                    callback: function (value) {
                      if ((value as number) % 1 === 0) {
                        return value;
                      }
                    },
                  },
                },
                xAxes: {
                  ticks: {
                    autoSkip: false,
                  },
                },
              },
            }}
          />
        ) : (
          <Typography>None</Typography>
        )}
      </GridCard>
    </>
  );
}
