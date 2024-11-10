import React from "react";
import { Box, Typography } from "@mui/material";
import { GridCard } from "components/common";
import {
  calculateAccuracyColor,
  calculateWPMColor,
} from "components/standard-game/feedback/speed-progress";
import { secondsToHms } from "constants/helperFunctions";
import { BaseStats } from "constants/stats";
import { useStats } from "contexts/StatsContext";

interface ImproveStatsProps {
  baseStats: BaseStats;
}

export default function ImproveStats({ baseStats }: ImproveStatsProps) {
  const { improvementRaces } = useStats();

  const testRaces = improvementRaces.filter(
    ({ improvementCategory }) => improvementCategory === "main"
  );

  const practiceRaces = improvementRaces.filter(
    ({ improvementCategory }) => improvementCategory !== "main"
  );
  return (
    <GridCard
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        padding: 5,
        columnGap: 10,
      }}
    >
      {[
        {
          name: "WPM",
          value: baseStats.averages.wpm.toFixed(1),
          color: calculateWPMColor(baseStats.averages.wpm, 1),
        },
        {
          name: "Accuracy",
          value: baseStats.averages.accuracy.toFixed(1),
          color: calculateAccuracyColor(baseStats.averages.accuracy, 1),
        },
        {
          name: "Best WPM",
          value: baseStats.best.wpm.toFixed(1),
          color: calculateWPMColor(baseStats.best.wpm, 1),
        },
        {
          name: "Average WPM",
          value: baseStats.averages.wpm.toFixed(1),
          color: calculateWPMColor(baseStats.averages.wpm, 1),
        },
        {
          name: "Average WPM",
          value: baseStats.averages.wpm.toFixed(1),
          color: calculateWPMColor(baseStats.averages.wpm, 1),
        },
        {
          name: "Tests",
          value: testRaces.length,
        },
        {
          name: "Practice Tests",
          value: practiceRaces.length,
        },
        {
          name: "Time Spent",
          value: secondsToHms(
            testRaces.reduce(
              (time, { wpm, passage }) =>
                time + (1 / wpm) * (passage.length / 5),
              0
            ) * 60
          ),
        },
        {
          name: "Practice Time",
          value: secondsToHms(
            practiceRaces.reduce(
              (time, { wpm, passage }) =>
                time + (1 / wpm) * (passage.length / 5),
              0
            ) * 60
          ),
        },
        {
          name: "Average WPM",
          value: baseStats.averages.wpm.toFixed(1),
          color: calculateWPMColor(baseStats.averages.wpm, 1),
        },
        {
          name: "Average WPM",
          value: baseStats.averages.wpm.toFixed(1),
          color: calculateWPMColor(baseStats.averages.wpm, 1),
        },
        {
          name: "Average WPM",
          value: baseStats.averages.wpm.toFixed(1),
          color: calculateWPMColor(baseStats.averages.wpm, 1),
        },
      ].map(({ name, value, color }, index) => (
        <Box key={`stat_${index}_${name}_${value}`} mb={3} flex={1}>
          <StatDisplay stat={name} value={value} color={color} />
        </Box>
      ))}
    </GridCard>
  );
}

interface StatDisplayProps {
  stat: string;
  value: string | number;
  color?: string;
}

const StatDisplay = ({ stat, value, color }: StatDisplayProps) => {
  return (
    <Box>
      <Typography variant="subtitle1" whiteSpace="nowrap">
        {stat}
      </Typography>
      <Typography
        variant="h4"
        color={color || "text.primary"}
        whiteSpace="nowrap"
      >
        {value}
      </Typography>
    </Box>
  );
};
