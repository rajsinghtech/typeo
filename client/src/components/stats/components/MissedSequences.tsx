import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";
import { Bar } from "react-chartjs-2";
import { BarChartData } from "../../../constants/graphs";
import { GridCard } from "../../common";
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
import { useGameSettings } from "../../../contexts/GameSettings";
import { useStats } from "../../../contexts/StatsContext";
import { Timeframes } from "../../../constants/stats";

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
  responsiveChart?: boolean;
  interactive?: boolean;
}

export default function MissedSequences({
  missedSequences,
  responsiveChart,
  interactive,
}: MissedsequencesProps) {
  const [timeframe, setTimeframe] = React.useState<number>(Timeframes.LAST_100);
  const [missedSequenceData, setMissedSequenceData] =
    React.useState<BarChartData>();

  const { gameSettings, setGameSettings } = useGameSettings();

  const { getMissedSequences } = useStats();

  const defaultColors = [...defaultBackgroundColors];

  const [backgroundColors, setBackgroundColors] =
    React.useState<string[]>(defaultColors);

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
      missedSequences || getMissedSequences(timeframe)
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
  }, [timeframe, getMissedSequences]);

  return (
    <>
      {!missedSequences ? (
        <FormControl variant="standard" sx={{ minWidth: 200, mb: 3 }}>
          <InputLabel id="missedsequence-timeframe-label">Timeframe</InputLabel>
          <Select
            label="Timeframe"
            labelId="missedsequence-timeframe-label"
            value={`${timeframe}`}
            onChange={handleTimeframeChange}
          >
            <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
            <MenuItem value={Timeframes.LAST_100}>Last 100 Races</MenuItem>
            <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
            <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
            <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
          </Select>
        </FormControl>
      ) : null}
      <GridCard sx={{ textAlign: "center" }}>
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
        <Typography variant="h5">Missed Sequences</Typography>
        {missedSequenceData && missedSequenceData.labels.length > 0 ? (
          <Bar
            width={responsiveChart === false ? "600px" : "inherit"}
            data={missedSequenceData}
            options={{
              onClick: (event, element) => {
                if (!interactive) return;
                if (element.length > 0 && missedSequenceData) {
                  const elementIndex = element[0].index;

                  togglePracticeStringsValue(elementIndex);
                }
              },
              animation: {
                duration: interactive ? 0 : 1200,
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
