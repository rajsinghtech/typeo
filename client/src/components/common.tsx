import React from "react";
import { Placement, TextVariant } from "constants/common";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@mui/system";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import {
  Card,
  TextField,
  Typography,
  Tooltip,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
  Box,
  Chip,
  InputLabel,
} from "@mui/material";

type DefaultProps = {
  fontSize?: string;
  children?: React.ReactNode;
  [x: string]: unknown;
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
  const StyledAlert = styled(Alert)(() => ({
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
  const StyledAlert = styled(Alert)(() => ({
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
  noBorder?: boolean;
  noStyle?: boolean;
  textalign?: string;
  color?: string;
  sx?: any;
  children?: React.ReactNode;
  [x: string]: unknown;
}

export const GridCard = ({
  refObject,
  padding,
  accent,
  noBorder,
  noStyle,
  textalign,
  color,
  sx,
  children,
  ...rest
}: GridCardProps) => {
  // const BorderCard = styled(ElevatedCard)(({ theme }) => ({
  //   padding: props.spacing || "4px",
  //   background: theme.palette.background.paper,
  //   borderRadius: "3px",
  //   borderLeft: props.accent ? "2px solid white" : "none",
  // }));

  const theme = useTheme();

  const styles = {
    card: {
      padding: padding || theme.spacing(2),
      textAlign: textalign || "left",
      backgroundColor: color || theme.palette.background.paper,
      backgroundImage: "none",
      color: theme.palette.text.secondary,
      borderRadius: "15px",
      border: noBorder ? "none" : "2px solid #393C49",
      borderLeft: accent
        ? "2px solid white"
        : noBorder
        ? "none"
        : "2px solid #393C49",
    },
  };

  return (
    <>
      {!noStyle ? (
        <Card
          ref={refObject}
          elevation={10}
          {...rest}
          sx={{ ...styles.card, ...sx }}
        >
          {children}
        </Card>
      ) : (
        <Box sx={{ ...sx }}>{children}</Box>
      )}
    </>
  );
};

interface HoverableTextProps {
  text: string;
  hoverText: string;
  placement?: Placement;
  variant?: TextVariant;
  sx?: any;
  [x: string]: unknown;
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

interface SelectMenuProps {
  value: number;
  handleValueChange: (event: SelectChangeEvent) => void;
  options: { name: string; value: number }[];
  label?: string;
}

export const SelectMenu = ({
  value,
  handleValueChange,
  options,
  label,
}: SelectMenuProps) => {
  return (
    <FormControl>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <Select
        variant="outlined"
        label={label}
        size="small"
        value={`${value}`}
        onChange={handleValueChange}
      >
        {options.map((option) => {
          return (
            <MenuItem key={uuidv4()} value={option.value}>
              {option.name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

interface MultipleSelectMenuProps {
  value: number[];
  handleValueChange: (event: SelectChangeEvent) => void;
  options: { name: string; value: number }[];
  label?: string;
}

export const MultipleSelectMenu = ({
  value,
  handleValueChange,
  options,
  label,
}: MultipleSelectMenuProps) => {
  return (
    <FormControl sx={{ width: { xs: "100%", sm: "150px" } }}>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <Select
        multiple
        label={label}
        size="small"
        //@ts-expect-error should be array here
        value={value.map((val) => `${val}`)}
        renderValue={(selected) => {
          if (selected.length === options.length) return "All";
          console.log(selected);
          //@ts-expect-error should be array here
          const selectedNames: string[] = selected.map(
            (val: string) =>
              options[
                options.findIndex(
                  (optionVal) => optionVal.value === parseInt(val)
                )
              ].name
          );

          return selectedNames.join(", ");
        }}
        onChange={handleValueChange}
      >
        <MenuItem value={-1}>
          <Checkbox checked={value.length === options.length} />
          <ListItemText primary={"All"} />
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={uuidv4()} value={option.value}>
            <Checkbox checked={value.indexOf(option.value) > -1} />
            <ListItemText primary={option.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const getMultiSelectUpdate = (
  changeValue: string | string[],
  optionNames: string[]
): number[] => {
  if (typeof changeValue === "string") changeValue = changeValue.split(",");
  const selectedVal = parseInt(changeValue[changeValue.length - 1]);

  let newValues = changeValue
    .slice(0, changeValue.length - 1)
    .map((val) => parseInt(val));

  if (selectedVal === -1) {
    if (newValues.length === optionNames.length) {
      newValues = [0];
    } else {
      newValues = optionNames.map((_, i) => i);
    }
  } else {
    if (newValues.includes(selectedVal)) {
      if (newValues.length > 1) {
        newValues.splice(newValues.indexOf(selectedVal), 1);
      }
    } else {
      newValues.push(selectedVal);
    }
  }

  return newValues;
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
