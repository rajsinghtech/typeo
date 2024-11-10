import React from "react";
import { Theme } from "@mui/system";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { GridCard } from "components/common";
import {
  calculateWPMColor,
  calculateAccuracyColor,
} from "components/standard-game/feedback/speed-progress";
import useRank from "pages/improve/hooks/useRank";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import { useEffect, useState } from "react";
import DraggableFlex, { DraggableFlexItem } from "components/draggable-flex";
import { useStats } from "contexts/StatsContext";
import { RaceSchema } from "constants/schemas/race";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "contexts/AuthContext";
import * as IMPROVEMENT_API from "api/rest/improvement";
import { Category, emptyCategory } from "constants/improvement";

interface PracticeCategoriesProps {
  setActiveTest: (id: string) => void;
}

export default function PracticeCategories({
  setActiveTest,
}: PracticeCategoriesProps) {
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryTests, setCategoryTests] = useState<Category[]>([]);

  const { improvementRaces } = useStats();

  const { currentUser } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const getCategories = async () => {
      const categories = await IMPROVEMENT_API.getImprovementCategories(
        currentUser
      );

      if (isMounted) {
        setCategoryTests(categories);
        console.log([...categoryTests, emptyCategory]);
        setLoadingCategories(false);
      }
    };
    getCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {loadingCategories ? (
        <CircularProgress size={40} />
      ) : (
        <DraggableFlex itemWidth={225} itemHeight={310}>
          {[...categoryTests, emptyCategory].map(
            ({ practiceStrings, name, color }, index) => {
              const categoryId = practiceStrings.join("-");
              const { wpm, accuracy, numRaces } = getStatsByCategory(
                improvementRaces,
                categoryId
              );
              if (index < categoryTests.length) {
                return (
                  <DraggableFlexItem id={categoryId} key={categoryId}>
                    <CustomizedTest
                      id={categoryId}
                      name={name}
                      color={color}
                      wpm={wpm}
                      accuracy={accuracy}
                      numRaces={numRaces}
                      setActiveTest={setActiveTest}
                    />
                  </DraggableFlexItem>
                );
              } else {
                return (
                  <DraggableFlexItem id="New">
                    <CustomizedTest
                      id="none"
                      wpm={0}
                      accuracy={0}
                      numRaces={0}
                      setActiveTest={(id: string) => null}
                    >
                      <Button
                        variant="outlined"
                        color="secondary"
                        sx={{
                          position: "absolute",
                          visibility: "visible",
                          top: 0,
                          left: 0,
                          height: "100%",
                          width: "100%",
                          borderRadius: "15px",
                          borderWidth: "2px",
                          color: "text.secondary",
                          "&:hover": {
                            borderWidth: "2px",
                            color: "secondary.main",
                          },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 45 }} />
                      </Button>
                    </CustomizedTest>
                  </DraggableFlexItem>
                );
              }
            }
          )}
        </DraggableFlex>
      )}
    </>
  );
}

interface CustomizedTestProps {
  id: string;
  wpm: number;
  accuracy: number;
  numRaces: number;
  setActiveTest: (id: string) => void;
  name?: string;
  color?: string;
  children?: React.ReactNode;
}

export function CustomizedTest({
  id,
  wpm,
  accuracy,
  numRaces,
  name,
  color,
  children,
  setActiveTest,
}: CustomizedTestProps) {
  const rank = useRank(wpm, accuracy);
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      alignItems="center"
      sx={{ cursor: "pointer" }}
    >
      <GridCard
        textalign="center"
        noBorder
        sx={{
          position: "relative",
          width: "100%",
          height: "275px",
          visibility: children ? "hidden" : "visible",
          border: (theme: Theme) =>
            color ? `4px solid ${theme.palette[color]?.main || color}` : "none",
        }}
      >
        {children}
        <Box display="flex" flexDirection="column" gap={1} alignItems="center">
          <Typography color="secondary">
            {id.replaceAll("-", ", ").toUpperCase()}
          </Typography>

          <Box display="flex" gap={1}>
            <Typography fontSize="xs">WPM:</Typography>
            <Typography fontSize="xs" color={calculateWPMColor(wpm, 1)}>
              {numRaces === 0 ? (
                <DoDisturbIcon fontSize="small" />
              ) : (
                wpm.toFixed(1)
              )}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Typography fontSize="xs">Accuracy:</Typography>
            <Typography
              fontSize="xs"
              color={calculateAccuracyColor(accuracy, 1)}
            >
              {numRaces === 0 ? (
                <DoDisturbIcon fontSize="small" />
              ) : (
                accuracy.toFixed(1)
              )}
            </Typography>
          </Box>
          <img
            src={rank.rankImage}
            alt={rank.rankName}
            width="75px"
            height="75px"
          />

          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() => setActiveTest(id)}
          >
            Train
          </Button>
        </Box>
      </GridCard>
      {name && color && (
        <Typography
          variant="subtitle1"
          sx={{
            color: (theme: Theme) => theme.palette[color]?.main || color,
          }}
        >
          {name.toUpperCase()}
        </Typography>
      )}
    </Box>
  );
}

const getStatsByCategory = (
  improvementRaces: RaceSchema[],
  category: string
) => {
  const categoryRaces = improvementRaces.filter((race) => {
    return race.improvementCategory === category;
  });

  if (categoryRaces.length === 0) {
    return { wpm: 0, accuracy: 0, numRaces: 0 };
  }

  const averages = categoryRaces.reduce(
    (stats, race) => {
      const wpm = stats.wpm + race.wpm;
      const accuracy = stats.accuracy + race.accuracy;
      return { wpm, accuracy };
    },
    { wpm: 0, accuracy: 0 }
  );

  return {
    wpm: averages.wpm / categoryRaces.length,
    accuracy: averages.accuracy / categoryRaces.length,
    numRaces: categoryRaces.length,
  };
};
