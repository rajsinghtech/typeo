import { Box, Button, Typography } from "@mui/material";
import { GridCard } from "components/common";
import { LinearProgressWithLabel } from "components/standard-game/feedback/speed-progress";
import { RankData } from "constants/rank";
import React from "react";
import NotInterestedIcon from "@mui/icons-material/NotInterested";

interface RankDisplayProps {
  rank: RankData;
  setActiveTest: (id: string) => void;
}

export default function RankDisplay({ rank, setActiveTest }: RankDisplayProps) {
  return (
    <GridCard
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pb: 3,
        gap: 1,
      }}
    >
      <img src={rank.rankImage} alt="Bronze1" width="150px" height="150px" />
      <Typography
        variant="h4"
        color={rank.rankColor}
        sx={{ textShadow: rank.rankShadow }}
        mt={3}
        mb={1}
      >
        {rank.rankName}
      </Typography>

      <Typography variant="h6">{`Rank Progress`}</Typography>
      <Box display="flex" justifyContent="center" width="100%" gap={2}>
        {rank.prevRankName ? (
          <img
            src={rank.prevRankImage}
            alt={rank.prevRankName}
            width="25px"
            height="25px"
          />
        ) : (
          <NotInterestedIcon color="error" />
        )}
        <Box flex={0.75}>
          <LinearProgressWithLabel
            value={!rank.nextRankName ? 100 : rank.rankProgress}
            step={5}
            fillColor={rank.rankColor}
          />
        </Box>
        {rank.nextRankName ? (
          <img
            src={rank.nextRankImage}
            alt={rank.nextRankName}
            width="25px"
            height="25px"
          />
        ) : (
          <NotInterestedIcon color="error" />
        )}
      </Box>
      {rank.nextRankName && (
        <>
          <Typography>{`(WPM required ${rank.wpmForNextRank})`}</Typography>
          {/* {accuracyForNextRank <= 100 && (
          <>
            <Typography>
              {`(Accuracy required ${accuracyForNextRank.toFixed(1)})`}
            </Typography>
          </>
        )} */}
        </>
      )}

      <Button
        variant="contained"
        sx={{ width: "75%", mb: 1, mt: 3 }}
        onClick={() => setActiveTest("main")}
      >
        Play
      </Button>
    </GridCard>
  );
}
