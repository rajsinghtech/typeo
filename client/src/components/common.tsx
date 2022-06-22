import React from "react";
import { useTheme } from "@mui/system";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import {
  Card,
  Snackbar,
  SnackbarCloseReason,
  TextField,
  Avatar,
  Typography,
  Tooltip,
} from "@mui/material";
import { css } from "@emotion/react";
import { Placement, TextVariant } from "../constants/common";

type DefaultProps = {
  fontSize?: string;
  children?: any;
  [x: string]: any;
};

export const StyledTextField = (props: DefaultProps) => {
  const theme = useTheme();

  const styles = {
    textInput: {
      fontSize: props.fontSize,
      "&:WebkitAutofill": {
        WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
        WebkitTextFillColor: "white",
      },
    },
  };

  return <TextField {...props} InputProps={{ style: styles.textInput }} />;
};

export const ErrorAlert = (props: DefaultProps) => {
  const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: "5px",
    color: "black",
    backgroundColor: "rgb(253, 236, 234)",
  }));

  return (
    <StyledAlert severity="error" {...props}>
      {props.children}
    </StyledAlert>
  );
};

export const SuccessAlert = (props: DefaultProps) => {
  const StyledAlert = styled(Alert)(({ theme }) => ({
    marginTop: "5px",
    color: "black",
    backgroundColor: "rgb(237, 247, 237)",
  }));

  return (
    <StyledAlert severity="success" {...props}>
      {props.children}
    </StyledAlert>
  );
};

export const ElevatedCard = (props: DefaultProps) => {
  return (
    <Card {...props} elevation={10}>
      {props.children}
    </Card>
  );
};

interface GridCardProps {
  refObject?: React.RefObject<HTMLDivElement>;
  padding?: string;
  accent?: boolean;
  textalign?: string;
  color?: string;
  sx?: any;
  children?: any;
  [x: string]: any;
}

export const GridCard = (props: GridCardProps) => {
  // const BorderCard = styled(ElevatedCard)(({ theme }) => ({
  //   padding: props.spacing || "4px",
  //   background: theme.palette.background.paper,
  //   borderRadius: "3px",
  //   borderLeft: props.accent ? "2px solid white" : "none",
  // }));

  const theme = useTheme();

  const styles = {
    card: {
      padding: props.padding || theme.spacing(2),
      textAlign: props.textalign || "left",
      backgroundColor: props.color || theme.palette.background.paper,
      backgroundImage: "none",
      color: theme.palette.text.secondary,
      borderRadius: "3px",
      borderLeft: props.accent ? "2px solid white" : "none",
    },
  };

  const { refObject, accent, sx, ...rest } = props;
  return (
    <Card
      ref={refObject}
      elevation={10}
      {...rest}
      sx={{ ...styles.card, ...sx }}
    >
      {props.children}
    </Card>
  );
};

interface HoverableTextProps {
  text: string;
  hoverText: string;
  placement?: Placement;
  variant?: TextVariant;
  sx?: any;
  [x: string]: any;
}
export const HoverableText = ({
  text,
  hoverText,
  placement,
  variant,
  sx,
  ...rest
}: HoverableTextProps) => {
  return (
    <Tooltip
      title={<Typography variant="body1">{hoverText}</Typography>}
      placement={placement}
      sx={{ ...sx, cursor: "pointer" }}
    >
      <Typography {...rest} variant={variant}>
        {text}
      </Typography>
    </Tooltip>
  );
};

// interface DSnackbarProps {
//   open: boolean;
//   status: "success" | "info" | "warning" | "error";
//   handleClose: (event: any, reason?: any) => void;
// }

// export function DynamicSnackbar({ open, status, handleClose }: DSnackbarProps) {
//   return (
//     <>
//       <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
//         <Alert onClose={handleClose} severity={status} sx={{ width: "100%" }}>
//           This is a success message!
//         </Alert>
//       </Snackbar>
//     </>
//   );
// }

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef<() => void>(() => {
    null;
  });

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
