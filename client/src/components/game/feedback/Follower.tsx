import React from "react";
import { keyframes } from "@mui/system";
import { Box, Container } from "@mui/material";
import { RaceState } from "../RaceLogic";

const usePrevious = (value: any): any => {
  const ref = React.useRef<any>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

interface CharOffsets {
  ccol: number;
  ccot: number;
  ccw: number;
}

interface FollowerProps {
  wbRef: React.RefObject<HTMLDivElement>;
  raceState: RaceState;
  disabled?: boolean;
}

const Follower = ({ wbRef, raceState, disabled }: FollowerProps) => {
  const [charOffsets, setcharOffsets] = React.useState<CharOffsets>({
    ccol: 0,
    ccot: 0,
    ccw: 0,
  });
  const prevCharOffsets = usePrevious(charOffsets) || {
    ccol: 0,
    ccot: 0,
    ccw: 0,
  };

  const updateFollower = () => {
    if (
      wbRef.current &&
      wbRef.current.children[1] &&
      wbRef.current.offsetLeft
    ) {
      const charInfo = wbRef.current.children[raceState.wordsTyped].children[
        raceState.currentCharIndex - raceState.currentWordIndex
      ] as HTMLDivElement;
      if (!charInfo) return;
      if (charInfo.offsetTop > 155)
        wbRef.current.style.top = `-${charInfo.offsetTop - 149}px`;
      const ccol = wbRef.current.offsetLeft + charInfo?.offsetLeft - 1;
      const ccot = wbRef.current.offsetTop + charInfo?.offsetTop - 2.5;
      const ccw = charInfo?.offsetWidth + 3;
      setcharOffsets({ ccol, ccot, ccw });
    }
  };

  React.useEffect(() => {
    const initFollowerInterval = setInterval(() => {
      if (wbRef.current && wbRef.current.children[0]) {
        updateFollower();
        clearInterval(initFollowerInterval);
      }
    }, 100);

    const resizeListener = () => {
      updateFollower();
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  React.useEffect(() => {
    updateFollower();
  }, [raceState]);

  const followerSlide = keyframes`
        from {
          left: ${prevCharOffsets.ccol}px;
          width: ${prevCharOffsets.ccw}px
        }
        to {
          left: ${charOffsets.ccol}px;
        }
      `;

  const styles = {
    follower: {
      marginTop: "-2.5px",
      position: "absolute",
      left: `${charOffsets.ccol}px`,
      top: `${charOffsets.ccot}px`,
      width: `${charOffsets.ccw}px`,
      minHeight: "42px",
      backgroundColor: "rgba(158, 219, 145, 0.3)",
      animation: `${followerSlide} ${
        !prevCharOffsets.ccol
          ? 0.15
          : prevCharOffsets.ccol || 0 > charOffsets.ccol
          ? 0.15
          : 0.09
      }s`,
    },
  };

  return <Box sx={styles.follower} display={disabled ? "none" : "block"}></Box>;
};

export default React.memo(Follower);
