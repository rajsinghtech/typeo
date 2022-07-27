import React from "react";
import { Box, keyframes } from "@mui/material";
import { PATH_OFFSET_TOP_PERCENTAGE } from "..";

export const EXPLOSION_TIME = 1200;

export const PARTICLE_COLORS = [
  "rgba(255, 0, 0, 0.5)",
  "rgba(0, 255, 0, 0.5)",
  "rgba(0, 0, 255, 0.5)",
];

export interface ParticleType {
  x: number;
  y: number;
  color: string;
}

export interface ExplosionType {
  offsetLeft: number;
  uid: string;
  particleData: ParticleType[];
}

export default React.memo(function Explosion({
  offsetLeft,
  particleData,
}: {
  offsetLeft: number;
  particleData: ParticleType[];
}) {
  return (
    <>
      {particleData.map(({ x, y, color }, index) => {
        return (
          <Box
            key={`p${index}_${x}_${y}`}
            sx={{
              opacity: 0,
              animation: `${keyframes`
            0% {
              opacity: 1;
              top: ${PATH_OFFSET_TOP_PERCENTAGE + 3}%;
              left: ${offsetLeft}px;
            }
            100% {
              opacity: 0;
              top: calc(${PATH_OFFSET_TOP_PERCENTAGE + 3}% + ${y}px);
              left: ${offsetLeft + x}px;
            }`} ${EXPLOSION_TIME}ms cubic-bezier(0, 0.87, 0.49, 0.9)`,
              boxShadow: `0 0 5px 2px ${color}`,
            }}
            position="absolute"
            bgcolor="rgba(255, 255, 255, 0.8)"
            top={`calc(50% + ${y}px)`}
            left={`calc(50% + ${x}px)`}
            width="7px"
            height="7px"
            borderRadius="50%"
          ></Box>
        );
      })}
    </>
  );
});
