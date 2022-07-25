import React from "react";
import { GridCard } from "components/common";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Grid, Typography } from "@mui/material";

interface LeaderboardItemProps {
  place: number;
  name: string;
  accuracy: number;
  wpm: number;
}

const itemStyle = {
  position: "absolute",
  margin: 0,
  transform: "translateY(-50%)",
  top: "50%",
  color: "secondary.main",
};

export default function LeaderboardItem({
  place,
  name,
  accuracy,
  wpm,
}: LeaderboardItemProps) {
  return (
    <GridCard sx={{ my: 2 }} color={getPlaceColor(place)} noBorder>
      <Grid container columnSpacing={1}>
        <Grid item xs={2}>
          <Typography
            variant={place < 4 ? "h4" : "body1"}
            color={place === 1 ? "gold" : "secondary"}
          >
            {place}
            {place === 1 ? (
              <EmojiEventsIcon fontSize="large" sx={{ pt: 1 }} />
            ) : null}
          </Typography>
        </Grid>
        <Grid item xs={6} position="relative" overflow="hidden">
          <Typography sx={itemStyle}>{name.substring(0, 15)}</Typography>
        </Grid>
        <Grid
          item
          xs={2}
          position="relative"
          visibility={{ xs: "hidden", md: "visible" }}
        >
          <Typography sx={itemStyle}>{accuracy.toFixed(1)}%</Typography>
        </Grid>
        <Grid item xs={2} position="relative">
          <Typography sx={itemStyle} right={0}>
            {wpm.toFixed(1)}
          </Typography>
        </Grid>
      </Grid>
    </GridCard>
  );
}

const getPlaceColor = (place: number) => {
  switch (place) {
    case 1:
      return "info.main";
    case 2:
      return "primary.main";
    case 3:
      return "warning.main";

    default:
      return "#393C49";
  }
};
