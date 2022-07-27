import React from "react";
import { DefenderStateReducerActions } from "components/defender/hooks/DefenderLogic";
import { Box, keyframes } from "@mui/material";
import { PATH_OFFSET_TOP_PERCENTAGE } from "components/defender";

const BULLET_TIME = 250;

interface BulletProps {
  offsetLeft: number;
  uid: string;
  enemyBoxRef: React.RefObject<HTMLDivElement>;
  dispatch: React.Dispatch<DefenderStateReducerActions>;
}

export default React.memo(function Bullet({
  offsetLeft,
  uid,
  enemyBoxRef,
  dispatch,
}: BulletProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        transform: "translate(50%, 82%)",
        animation: `${keyframes`
    0% {
      transform: translate(50%, 82%)
    }
    100% {
      transform: translate(${offsetLeft}px, ${PATH_OFFSET_TOP_PERCENTAGE + 3}%)
    }
    `} ${BULLET_TIME}ms linear`,
      }}
      onAnimationEnd={() =>
        dispatch({ type: "bulletHit", bulletUID: uid, enemyBoxRef })
      }
    >
      <Box
        sx={{ boxShadow: `0 0 4px 2px rgba(227, 252, 3, 1)` }}
        bgcolor="white"
        width="4px"
        height="4px"
        borderRadius="50%"
      ></Box>
    </Box>
  );
});
