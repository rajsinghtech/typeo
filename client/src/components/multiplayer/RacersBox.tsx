import React from "react";
import { GridCard } from "components/common";
import { OnlineRaceData, PLAYER_COLORS } from "components/multiplayer/ffa-game";
import {
  calculateWPMColor,
  LinearProgressWithLabel,
} from "components/standard-game/feedback/speed-progress";
import PowerOffIcon from "@mui/icons-material/PowerOff";
import { Box, Grid, Typography } from "@mui/material";

interface RacersBoxProps {
  racerData: OnlineRaceData;
  passage: string;
}

export default function RacersBox({ racerData, passage }: RacersBoxProps) {
  const stepAmount = (1 / passage.split(" ").length) * 100;
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {racerData.playerData.map((racer, index) => {
        return (
          <GridCard key={racer.id} noBorder>
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" flex={1} overflow="hidden" gap={2}>
                {!racer.isConnected && <PowerOffIcon color="error" />}
                <Typography
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
                  {racer.displayName}
                </Typography>
              </Box>
              <Box flex={5}>
                <LinearProgressWithLabel
                  label={racer.wpm}
                  labelTextVariant={"h6"}
                  step={stepAmount}
                  value={(racer.currentCharIndex / passage.length) * 100}
                  fillColor={PLAYER_COLORS[index]}
                />
              </Box>
            </Box>
          </GridCard>
        );
      })}
    </Box>
  );
}
