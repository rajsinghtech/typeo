import React from "react";
import { keyframes } from "@mui/system";
import { Box, Container } from "@mui/material";

function usePrevious(value: any) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}

interface FollowerProps {
  ccol: number;
  ccot: number;
  ccw: number;
  disabled?: boolean;
}

const Follower = ({ ccol, ccot, ccw, disabled }: FollowerProps) => {
  const prevCCOL = usePrevious(ccol);
  const prevCCW = usePrevious(ccw);

  const followerSlide = keyframes`
    from {
      left: ${prevCCOL}px;
      width: ${prevCCW}px
    }
    to {
      left: ${ccol}px;
    }
  `;

  const styles = {
    follower: {
      marginTop: "-2.5px",
      position: "absolute",
      left: `${ccol}px`,
      top: `${ccot}px`,
      width: `${ccw}px`,
      minHeight: "42px",
      backgroundColor: "rgba(158, 219, 145, 0.3)",
      animation: `${followerSlide} ${
        !prevCCOL ? 0.15 : prevCCOL || 0 > ccol ? 0.15 : 0.09
      }s`,
    },
  };

  return <Box sx={styles.follower} display={disabled ? "none" : "block"}></Box>;
};

export default React.memo(Follower);
