import React from "react";
import { GridCard } from "components/common";
import { Box, Typography } from "@mui/material";

interface StatCardProps {
  title: string;
  subtitle?: string;
  stat: number | string;
  icon: React.ReactNode;
}

export default function StatCard({ title, stat, icon }: StatCardProps) {
  return (
    <>
      <GridCard
        padding="12px"
        sx={{
          display: "flex",
          gap: "15px",
          paddingRight: "25px",
          justifyContent: "center",
          alignItems: "center",
          width: { xs: "100%", vs: "fit-content" },
        }}
      >
        <Box sx={{ alignSelf: "center" }}>{icon}</Box>
        <Box>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="h5" color="secondary">
            {typeof stat === "number" ? stat.toFixed(1) : stat}
          </Typography>
        </Box>
      </GridCard>
    </>
  );
}
