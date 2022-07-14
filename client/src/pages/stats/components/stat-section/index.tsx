import React from "react";
import { GridCard } from "components/common";
import StatCard from "pages/stats/components/stat-card";
import { RaceStats } from "constants/stats";
import { Divider, Grid, Box, Typography, Tooltip } from "@mui/material";

interface StatSectionProps {
  data: RaceStats;
  title: string;
}

export default function StatSection({ data, title }: StatSectionProps) {
  const GridStat = (name: string, value: string | number) => {
    return (
      <Grid
        zeroMinWidth
        key={`${name}_${value}`}
        item
        xs={12}
        sm={12}
        md={6}
        lg={4}
        xl={2.5}
      >
        <StatCard title={formatName(name)} stat={value} />
      </Grid>
    );
  };

  return (
    <>
      <GridCard sx={{ my: 3, width: "99%" }}>
        <Box paddingBottom={2}>
          <Typography variant="h6" display="inline-block">
            {title}
          </Typography>
          <Divider />
        </Box>
        <Grid container spacing={3}>
          {GridStat("WPM", data.wpm)}
          {GridStat("Accuracy", data.accuracy)}
          {data.mostMissedCharacter ? (
            <Tooltip
              title={
                <Typography variant="body1">Most Missed Character</Typography>
              }
              placement="top-end"
              sx={{ cursor: "pointer" }}
            >
              {GridStat("MMS", data.mostMissedCharacter)}
            </Tooltip>
          ) : null}
        </Grid>
      </GridCard>
    </>
  );
}

const formatName = (name: string) => {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
