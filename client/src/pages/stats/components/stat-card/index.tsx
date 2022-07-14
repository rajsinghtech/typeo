import React from "react";
import { GridCard } from "components/common";
import { useTheme } from "@mui/system";
import { Divider, Typography } from "@mui/material";

interface StatCardProps {
  title: string;
  subtitle?: string;
  stat: number | string;
}

export default function StatCard({ title, stat }: StatCardProps) {
  const theme = useTheme();
  return (
    <>
      <GridCard
        textalign="center"
        color={theme.palette.background.default}
        sx={{ height: "100%" }}
      >
        <Typography variant="h6" padding={1} sx={{ overflowWrap: "normal" }}>
          {title}
        </Typography>
        <Divider />
        <Typography variant="h5" color="secondary" paddingTop={3} bottom={0}>
          {typeof stat === "number" ? stat.toFixed(1) : stat}
        </Typography>
      </GridCard>
    </>
  );
}
