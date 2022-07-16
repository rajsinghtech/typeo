import React from "react";
import RocketIcon from "@mui/icons-material/Rocket";
import Box from "@mui/material/Box";

interface PlayerRocketProps {
  shipRotation: number;
}

export default function PlayerRocket({ shipRotation }: PlayerRocketProps) {
  return (
    <Box
      position="absolute"
      textAlign="center"
      width="100%"
      top="80%"
      sx={{ transform: `rotate(${shipRotation}deg)` }}
    >
      <RocketIcon fontSize="large" color="primary" />
    </Box>
  );
}
