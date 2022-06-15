import React from "react";
import { GridCard } from "../../../common";
import { Divider, Grid, Typography } from "@mui/material";
import {
  calculateWPMColor,
  LinearProgressWithLabel,
} from "../../feedback/SpeedProgress";
import { OnlineRaceData } from "../../types/FFAGame";

interface RacersBoxProps {
  racerData: OnlineRaceData;
}

export default function RacersBox({ racerData }: RacersBoxProps) {
  return (
    <GridCard accent={true}>
      {racerData.playerData.map((racer, index) => {
        return (
          <Grid
            key={racer.id}
            container
            spacing={0}
            padding={2}
            borderTop={index === 0 ? "1px solid gray" : "none"}
            borderBottom="1px solid gray"
          >
            <Grid item xs={3} position="relative">
              <Typography
                sx={{
                  margin: 0,
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {racer.displayName?.substring(0, 15)}
              </Typography>
            </Grid>
            <Grid item xs={9}>
              <LinearProgressWithLabel
                label={racer.wpm}
                labelTextVariant={"h6"}
                value={racer.percentage * 100}
                fillColor={calculateWPMColor(parseInt(racer.wpm), 1)}
              />
            </Grid>
          </Grid>
        );
      })}
    </GridCard>
  );
}
