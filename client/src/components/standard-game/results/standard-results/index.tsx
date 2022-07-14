import React from "react";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { GridCard, HoverableText } from "components/common";
import { ChartData } from "constants/graphs";
import { ResultsData } from "constants/race";
import StatKeyboard from "components/stats//stat-keyboard";
import {
  getCharacterSpeed,
  getMissedCharacterSequences,
} from "contexts/StatsContext";
import MissedSequences from "components/stats/missed-sequences";
import { calculateWPMColor } from "components/standard-game/feedback/speed-progress";
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Button,
  Dialog,
  Typography,
  Box,
  useTheme,
  Divider,
} from "@mui/material";

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

interface ResultsProps {
  open: boolean;
  onClose: (retry: boolean) => void;
  data: ResultsData;
}

export default function Results({
  open,
  onClose,
  data: {
    passage,
    startTime,
    dataPoints,
    accuracy,
    characters,
    testType,
    characterDataPoints,
  },
}: ResultsProps) {
  const [graphData, setGraphData] = React.useState<ChartData>();
  const [wpm, setWPM] = React.useState<number>(0);
  const [keyData, setKeyData] = React.useState<number[]>(new Array(26).fill(0));
  const theme = useTheme();

  React.useEffect(() => {
    setKeyData(getCharacterSpeed(characterDataPoints));
    // Update Graph
    if (dataPoints.length < 1) return;

    let averageWpmData: { x: string; y: number }[];
    if (dataPoints.length < 3) {
      const dataPoint = dataPoints[dataPoints.length - 1];
      averageWpmData = [
        { x: "0", y: dataPoint.wpm },
        {
          x: ((dataPoint.timestamp - startTime) / 1000).toFixed(1),
          y: dataPoint.wpm,
        },
      ];
    } else {
      const totalTestTime =
        (dataPoints[dataPoints.length - 1].timestamp -
          dataPoints[0].timestamp +
          1000) /
        1000;
      averageWpmData = dataPoints.map((val, index) => {
        return {
          x:
            index !== dataPoints.length - 1
              ? `${index + 1}`
              : totalTestTime.toFixed(1),
          y: val.wpm,
        };
      });

      if (totalTestTime - dataPoints.length < 0.15) {
        averageWpmData.splice(averageWpmData.length - 1, 1);
      }
    }

    const sectionWpmData = averageWpmData.map(({ x, y }, index) => {
      if (index === 0) return { x, y };
      return {
        x,
        y:
          (y - averageWpmData[index - 1].y) * index +
          averageWpmData[index - 1].y,
      };
    });

    const barBorderColors = sectionWpmData.map(({ y: wpm }) =>
      calculateWPMColor(wpm, 1)
    );

    const barBackgroundColors = sectionWpmData.map(({ y: wpm }) =>
      calculateWPMColor(wpm, 0.3)
    );

    setGraphData({
      datasets: [
        {
          type: "line",
          label: " average wpm ",
          data: averageWpmData,
          fill: true,
          borderColor: theme.palette.primary.main,
          tension: 0.1,
          order: 1,
        },
        {
          type: "bar",
          label: " section wpm ",
          data: sectionWpmData,
          fill: true,
          borderColor: barBorderColors,
          borderWidth: 1,
          backgroundColor: barBackgroundColors,
          maxBarThickness: 50,
          order: 2,
        },
      ],
    });

    // Update text
    setWPM(dataPoints[dataPoints.length - 1].wpm);
  }, [dataPoints, accuracy, characters, testType]);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          onClose(false);
        }}
        maxWidth="lg"
      >
        <Box
          p={3}
          textAlign="center"
          sx={{ overflowX: "hidden", overflowY: "scroll" }}
        >
          <GridCard
            sx={{
              marginBottom: 3,
            }}
          >
            <Box pt={2}>
              <Typography display="inline" variant="h3" pt={2}>
                WPM:
              </Typography>{" "}
              <Typography display="inline" variant="h3" color="secondary">
                {wpm.toFixed(1)}
              </Typography>
            </Box>
            <Box>
              <Typography display="inline">Accuracy:</Typography>{" "}
              <Typography display="inline" color="secondary">
                {accuracy.toFixed(1)} %
              </Typography>
            </Box>
            <Box>
              <Typography display="inline-block">Characters:</Typography>{" "}
              {Object.entries(characters).map(([key, val]) => (
                <span key={key}>
                  <HoverableText
                    text={`${val}`}
                    hoverText={key}
                    color={
                      key === "correct"
                        ? "success.main"
                        : key === "incorrect"
                        ? "error"
                        : "primary"
                    }
                    sx={{ display: "inline-block" }}
                  />
                  {key !== "total" ? " / " : ""}
                </span>
              ))}
            </Box>
            <Box>
              <Typography display="inline">Test Type:</Typography>{" "}
              <Typography display="inline" color="secondary">
                {testType.name}
                {testType.amount ? `, ${testType.amount}` : null}
              </Typography>
            </Box>
            <Box>
              <Typography display="inline">Text Type:</Typography>{" "}
              <Typography display="inline" color="secondary">
                {testType.textType}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box textAlign="center">
              <Button
                variant="contained"
                onClick={() => {
                  onClose(false);
                }}
                sx={{ mx: 2 }}
              >
                <Typography>Next</Typography>
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  onClose(true);
                }}
                sx={{ mx: 2 }}
              >
                <Typography>Retry</Typography>
              </Button>
            </Box>
          </GridCard>
          {graphData ? (
            <GridCard>
              <Box height="50vh" width="50vw">
                <Chart
                  data={graphData}
                  type="line"
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      xAxes: {
                        ticks: {
                          autoSkip: true,
                          maxTicksLimit: 30,
                        },
                      },
                      yAxes: {
                        ticks: {
                          maxTicksLimit: 5,
                          callback: function (value: number | string) {
                            if ((value as number) % 1 === 0) {
                              return value;
                            }
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
            </GridCard>
          ) : null}
          <Box mt={3}>
            <StatKeyboard data={keyData} title="Key Speed" />
          </Box>
          <Box mt={3}>
            <MissedSequences
              missedSequences={getMissedCharacterSequences(
                {},
                characterDataPoints,
                passage
              )}
            />
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
