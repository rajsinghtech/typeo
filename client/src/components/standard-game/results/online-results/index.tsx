import React from "react";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { minimizedDrawerWidth, drawerWidth } from "components/navigation";
import { GridCard, HoverableText } from "components/common";
import { GraphData } from "constants/graphs";
import { ResultsData } from "constants/race";
import { useHistory } from "react-router-dom";
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
  data: { dataPoints, accuracy, characters, testType },
  place,
  container,
}: ResultsProps) {
  const [graphData, setGraphData] = React.useState<GraphData>();
  const [isGraphOpen] = React.useState<boolean>(false);
  const graphRef = React.useRef<HTMLDivElement>();
  console.log("RENDERING RESULTS");
  const history = useHistory();
  const theme = useTheme();

  React.useEffect(() => {
    // Update Graph
    if (dataPoints.length < 2) return;
    const totalTestTime =
      (dataPoints[dataPoints.length - 1].timestamp -
        dataPoints[0].timestamp +
        1000) /
      1000;
    const newData = dataPoints.map((val, index) => {
      return {
        x:
          index !== dataPoints.length - 1
            ? `${index + 1}`
            : totalTestTime.toFixed(1),
        y: val.wpm,
      };
    });

    if (totalTestTime - dataPoints.length < 0.15) {
      newData.splice(newData.length - 1, 1);
    }

    setGraphData({
      datasets: [
        {
          label: " wpm ",
          data: newData,
          fill: true,
          borderColor: theme.palette.primary.main,
          tension: 0.1,
        },
      ],
    });
  }, [dataPoints, accuracy, characters, testType]);

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
        <Box p={3} minWidth={500} textAlign="center">
          <GridCard sx={{ mb: 3 }}>
            <>
              <Box>
                <Typography display="inline" variant="h3">
                  Place:
                </Typography>{" "}
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
                WPM:
              </Typography>{" "}
              <Typography display="inline" variant="h3" color="secondary">
                {wpm.toFixed(1)}
              </Typography>
            </Box>
            <Box>
              <Typography display="inline">Accuracy:</Typography>{" "}
              <Typography display="inline" color="secondary">
                {accuracy.toFixed(1)}
              </Typography>
            </Box>
            <Box>
              <Typography display="inline">Characters:</Typography>{" "}
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
                    display="inline"
                  />
                  {key !== "total" ? " / " : ""}
                </span>
              ))}
            </Box>
            <Box>
              <Typography display="inline">Test Type:</Typography>{" "}
              <Typography display="inline" color="secondary">
                Online
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box textAlign="center">
              <Button
                variant="contained"
                onClick={() => {
                  setOpen(false);
                  history.go(0);
                }}
                sx={{ mx: 2 }}
              >
                <Typography>Find Match</Typography>
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setOpen(false);
                }}
                sx={{ mx: 2 }}
              >
                <Typography>Exit</Typography>
              </Button>
            </Box>
          </GridCard>
          {graphData ? (
            <>
              <GridCard>
                <Box height="50vh" width="50vw" ref={graphRef}>
                  <Line
                    data={graphData}
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
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </GridCard>
            </>
          ) : null}
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
