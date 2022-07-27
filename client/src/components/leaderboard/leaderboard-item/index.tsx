import React from "react";
import { GridCard } from "components/common";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, Typography } from "@mui/material";

const styles = {
  section: {
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
};

interface LeaderboardItemProps {
  place: number | string;
  name: string;
  accuracy: number | string;
  wpm: number | string;
}

export default function LeaderboardItem({
  place,
  name,
  accuracy,
  wpm,
}: LeaderboardItemProps) {
  return (
    <GridCard sx={{ my: 2 }} color={getPlaceColor(place)} noBorder>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box sx={styles.section} minWidth={0}>
          {place === 1 ? (
            <EmojiEventsIcon
              sx={{
                color: "gold",
                fontSize: { xs: "25px", vs: "35px" },
              }}
            />
          ) : (
            <Typography
              variant={place < 4 ? "h4" : "body1"}
              color={
                place === 1
                  ? "gold"
                  : typeof place === "number"
                  ? "secondary"
                  : "inherit"
              }
            >
              {place}
            </Typography>
          )}

          <Typography
            color={typeof place === "number" ? "text.primary" : "inherit"}
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden"
            minWidth={0}
          >
            {name}
          </Typography>
        </Box>
        <Box sx={styles.section}>
          <Typography
            color={typeof place === "number" ? "text.primary" : "inherit"}
            display={{ xs: "none", vs: "block" }}
          >
            {typeof accuracy === "number"
              ? `${accuracy.toFixed(1)}%`
              : accuracy}
          </Typography>
          <Typography
            color={typeof place === "number" ? "text.primary" : "inherit"}
          >
            {typeof wpm === "number" ? wpm.toFixed(1) : wpm}
          </Typography>
        </Box>
      </Box>
    </GridCard>
  );
}

const getPlaceColor = (place: number | string) => {
  if (typeof place === "string") return "background.default";
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
