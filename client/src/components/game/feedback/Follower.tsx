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

const DefaultCharOffsets = {
  ccol: 0,
  ccot: 0,
  ccw: 0,
};

interface FollowerProps {
  wbRef: React.RefObject<HTMLDivElement>;
  raceState: RaceState;
  disabled?: boolean;
}

const Follower = ({ wbRef, raceState, disabled }: FollowerProps) => {
  console.log("Updating followers");
  const followerRef = React.useRef<HTMLDivElement>();

  const updateFollower = () => {
    if (
      wbRef.current &&
      wbRef.current.children[1] &&
      wbRef.current.offsetLeft &&
      followerRef.current
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

      if (ccot !== parseFloat(followerRef.current.style.top))
        followerRef.current.style.transitionDuration = "0.05s";
      else if (followerRef.current.style.transitionDuration !== "0.12s") {
        console.log(followerRef.current.style.transitionDuration);
        followerRef.current.style.transitionDuration = "0.12s";
      }

      followerRef.current.style.left = `${ccol}px`;
      followerRef.current.style.top = `${ccot}px`;
      followerRef.current.style.width = `${ccw}px`;
    }
  };

  //   const followerSlide = keyframes`
  //   from {
  //     left: ${prevccol}px;
  //     width: ${prevccw}px
  //   }
  //   to {
  //     left: ${ccol}px;
  //   }
  // `;

  const styles = {
    follower: {
      marginTop: "-2.5px",
      position: "absolute",
      // left: `${ccol}px`,
      // top: `${ccot}px`,
      // width: `${ccw}px`,
      minHeight: "42px",
      backgroundColor: "rgba(158, 219, 145, 0.3)",
      transition: `left linear, width linear`,
      transitionDuration: "0.12s",
      // animation: `${followerSlide} ${
      //   !prevccol ? 0.15 : prevccol || 0 > ccol ? 0.15 : 0.09
      // }s`,
    },
  };

  React.useEffect(() => {
    updateFollower();
  }, [raceState]);

  React.useEffect(() => {
    const initFollowerInterval = setInterval(() => {
      if (wbRef.current && wbRef.current.children[0]) {
        // updateFollower();
        clearInterval(initFollowerInterval);
      }
    }, 100);

    const resizeListener = () => {
      // updateFollower();
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  const FollowerBox = React.useMemo(() => {
    return (
      <Box
        ref={followerRef}
        sx={styles.follower}
        display={disabled ? "none" : "block"}
      ></Box>
    );
  }, [disabled]);

  return <>{FollowerBox}</>;
};

export default React.memo(Follower, (props, newProps) => {
  const { amount, statState, secondsRunning, ...state } = props.raceState;
  const {
    amount: newAmount,
    statState: newStatState,
    secondsRunning: newSecondsRunning,
    ...newState
  } = newProps.raceState;
  const raceState = JSON.stringify(state);
  const newRaceState = JSON.stringify(newState);

  if (raceState === newRaceState) return true;
  return false;
});
