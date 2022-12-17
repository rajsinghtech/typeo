import React from "react";
import useMutationObserver from "hooks/useMutationObserver";
import {
  RaceState,
  RaceStateSubset,
} from "components/standard-game/hooks/RaceLogic";
import { useGameSettings } from "contexts/GameSettings";
import { FollowerTypes, GameSettings, RaceTypes } from "constants/settings";
import { Box } from "@mui/material";

const styles = {
  marginTop: "-2.5px",
  position: "absolute",
  zIndex: 999,
};

interface FollowerProps {
  wbContainerRef: React.RefObject<HTMLDivElement>;
  wbRef: React.RefObject<HTMLDivElement>;
  raceState: RaceState | RaceStateSubset;
  settings: GameSettings;
  disabled?: boolean;
  isCorrect?: boolean;
  isEndOfPassage?: boolean;
  color?: string;
}

const Follower = ({
  wbContainerRef,
  wbRef,
  raceState,
  settings,
  disabled,
  isCorrect,
  isEndOfPassage,
  color,
}: FollowerProps) => {
  const followerRef = React.useRef<HTMLDivElement>(null);

  const updateFollowerHandler = () => {
    updateFollower(
      wbRef,
      wbContainerRef,
      followerRef,
      raceState,
      settings,
      isCorrect,
      isEndOfPassage
    );
  };

  useMutationObserver({
    ref: document.body,
    callback: (mutationList) => {
      if (mutationList.length <= 1) return;
      updateFollowerHandler();
    },
  });

  React.useEffect(() => {
    updateFollowerHandler();
  }, [raceState]);

  React.useEffect(() => {
    const resizeListener = () => {
      setTimeout(() => {
        updateFollowerHandler();
      }, 50);
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, [raceState, settings]);

  const FollowerBox = React.useMemo(() => {
    const typeStyles = [
      {
        ...styles,
        minHeight: "40px",
        backgroundColor: color || "rgba(158, 219, 145)",
        opacity: 0.2,
      },
      {
        ...styles,
        minHeight: "32px",
        borderLeft: "2px solid",
      },
      {
        ...styles,
        minHeight: "32px",
        borderBottom: "2px solid",
      },
    ];

    return (
      <Box
        ref={followerRef}
        sx={{
          ...typeStyles[
            color ? FollowerTypes.DEFAULT : settings.display.followerStyle
          ],
          transition: settings.display?.smoothFollower
            ? `left linear, width linear`
            : "none",
          transitionDuration: `${settings.display.followerSpeed}s`,
        }}
        display={disabled ? "none" : "block"}
      ></Box>
    );
  }, [disabled, settings]);

  return <>{FollowerBox}</>;
};

export default React.memo(Follower, (props, newProps) => {
  const { currentCharIndex, currentWordIndex, wordsTyped } = props.raceState;
  const {
    currentCharIndex: newCurrentCharIndex,
    currentWordIndex: newCurrentWordIndex,
    wordsTyped: newWordsTyped,
  } = newProps.raceState;

  return (
    currentCharIndex === newCurrentCharIndex &&
    currentWordIndex === newCurrentWordIndex &&
    wordsTyped === newWordsTyped &&
    props.isEndOfPassage === newProps.isEndOfPassage &&
    props.isCorrect === newProps.isCorrect &&
    props.disabled === newProps.disabled &&
    props.settings == newProps.settings
  );
});

const updateFollower = (
  wbRef: React.RefObject<HTMLDivElement>,
  wbContainerRef: React.RefObject<HTMLDivElement> | undefined,
  followerRef: React.RefObject<HTMLDivElement>,
  raceState: RaceState | RaceStateSubset,
  settings: GameSettings,
  isCorrect: boolean | undefined,
  isEndOfPassage: boolean | undefined
) => {
  if (
    wbRef.current &&
    wbRef.current.children[1] &&
    wbRef.current.offsetLeft &&
    followerRef.current
  ) {
    const wordRef = wbRef.current.children[raceState.wordsTyped];
    if (!wordRef) return;

    let charInfo = null;
    if (raceState.currentWordIndex === undefined) {
      charInfo = wordRef.children[
        isEndOfPassage ? wordRef.children.length - 2 : 0
      ] as HTMLDivElement;
    } else {
      charInfo = wordRef.children[
        raceState.currentCharIndex - raceState.currentWordIndex
      ] as HTMLDivElement;
    }
    if (!charInfo) return;
    if (charInfo.offsetTop > 155 && settings.raceType !== RaceTypes.ONLINE)
      wbRef.current.style.top = `-${charInfo.offsetTop - 149}px`;

    let containerOffsetLeft = 0;
    let containerOffsetTop = 0;
    if (wbContainerRef && wbContainerRef.current) {
      containerOffsetLeft = wbContainerRef.current.offsetLeft;
      containerOffsetTop = wbContainerRef.current.offsetTop;
    }

    const ccol =
      containerOffsetLeft + wbRef.current.offsetLeft + charInfo?.offsetLeft;
    const ccot =
      containerOffsetTop + wbRef.current.offsetTop + charInfo?.offsetTop - 4;
    const ccw = charInfo?.offsetWidth + 3;

    if (ccot !== parseFloat(followerRef.current.style.top))
      followerRef.current.style.transitionDuration = "0.03s";
    else if (followerRef.current.style.transitionDuration !== "0.1s") {
      followerRef.current.style.transitionDuration = `${
        settings.display?.followerSpeed || 0.1
      }s`;
    }

    followerRef.current.style.left = `${ccol}px`;
    followerRef.current.style.top = `${ccot}px`;
    followerRef.current.style.width = `${ccw}px`;

    if (isCorrect === undefined) return;
    if (!isCorrect) {
      followerRef.current.style.border = "2px solid red";
    } else {
      followerRef.current.style.border = "none";
    }
  }
};
