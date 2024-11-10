import React from "react";
import "chartjs-adapter-date-fns";
import { Chart } from "react-chartjs-2";
import { GridCard, HoverableText } from "components/common";
import { ChartData } from "constants/graphs";
import { ResultsData } from "constants/race";
import { JoinQueue } from "api/sockets/matchmaking";
import { useSocketContext } from "contexts/SocketContext";
import { calculateWPMColor } from "components/standard-game/feedback/speed-progress";
import StatKeyboard from "components/stats/stat-keyboard";
import MissedSequences from "components/stats/missed-sequences";
import {
  getCharacterSequenceData,
  getCharacterStatsMap,
} from "constants/helperFunctions";
import { CharacterStatsMap } from "constants/stats";
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
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
  LineController,
  Title,
  Tooltip,
  Legend
);

interface ResultsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  wpm: number;
  data: ResultsData;
  place: number;
  container: HTMLDivElement | null;
}

export default function OnlineResults({
  open,
  setOpen,
  wpm,
  data: {
    passage,
    startTime,
    dataPoints,
    accuracy,
    characters,
    testType,
    characterDataPoints,
  },
  place,
  container,
}: ResultsProps) {
  const [graphData, setGraphData] = React.useState<ChartData>();
  const [keyStats, setKeyStats] = React.useState<CharacterStatsMap>(new Map());
  const [isGraphOpen] = React.useState<boolean>(false);
  const graphRef = React.useRef<HTMLDivElement>();

  const { socket } = useSocketContext();

  const theme = useTheme();

  React.useEffect(() => {
    setKeyStats(getCharacterStatsMap(characterDataPoints, passage));

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
  }, [
    characterDataPoints,
    passage,
    dataPoints,
    accuracy,
    characters,
    testType,
  ]);

  React.useEffect(() => {
    if (graphRef.current && isGraphOpen) {
      graphRef.current.scrollIntoView();
    }
  }, [isGraphOpen]);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        container={container}
        sx={{ position: "absolute" }}
        PaperProps={{
          sx: {
            borderRadius: "7px",
          },
          style: {
            backgroundColor: place
              ? "transparent"
              : theme.palette.background.paper,
          },
        }}
      >
        <Box p={3} textAlign="center">
          <GridCard noBorder sx={{ mb: 3 }}>
            <>
              <Box>
                <Typography display="inline" variant="h3">
                  {"Place: "}
                </Typography>
                <Typography
                  display="inline"
                  variant="h3"
                  color={place === 1 ? "warning.main" : "primary"}
                >
                  {ToPlaceString(place)}
                </Typography>
              </Box>
              <Divider />
            </>
            <Box pt={2}>
              <Typography display="inline" variant="h3" pt={2}>
                {"WPM: "}
              </Typography>
              <Typography display="inline" variant="h3" color="secondary">
                {wpm.toFixed(1)}
              </Typography>
            </Box>
            <Box>
              <Typography display="inline">{"Accuracy: "}</Typography>
              <Typography display="inline" color="secondary">
                {`${accuracy.toFixed(1)}%`}
              </Typography>
            </Box>
            <Box>
              <Typography display="inline">{"Characters: "}</Typography>
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
                        : "info.main"
                    }
                    display="inline"
                  />
                  {key !== "total" ? " / " : ""}
                </span>
              ))}
            </Box>
            <Box>
              <Typography display="inline">{"Test Type: "}</Typography>
              <Typography display="inline" color="secondary">
                Online
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box textAlign="center">
              <Button
                variant="contained"
                color="info"
                onClick={() => {
                  JoinQueue(socket);
                  setOpen(false);
                }}
                sx={{ mx: 2 }}
              >
                <Typography>Find Match</Typography>
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setOpen(false);
                }}
                sx={{ mx: 2 }}
              >
                <Typography>Close</Typography>
              </Button>
            </Box>
          </GridCard>
          {graphData && (
            <GridCard noBorder>
              <Box height="50vh">
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
          )}
          <Box mt={3}>
            <StatKeyboard data={keyStats} title="Key Speed" noBorder />
          </Box>
          <Box mt={3}>
            <MissedSequences
              missedSequences={getCharacterSequenceData(
                {},
                characterDataPoints,
                passage
              )}
              noBorder
            />
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

const ToPlaceString = (place: number) => {
  switch (place) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    default:
      return `${place}th`;
  }
};
