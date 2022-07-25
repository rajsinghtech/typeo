import React from "react";
import { useGameSettings } from "contexts/GameSettings";
import { GridCard } from "components/common";
import {
  GameTypeNames,
  GameTypeAmounts,
  TextTypeNames,
  FollowerTypes,
  GameTypes,
} from "constants/settings";
import {
  Box,
  Button,
  Dialog,
  Divider,
  Grid,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

const GameTypeIcons = [
  <Typography key="timeSetting" fontSize="small">
    Time
  </Typography>,
  <Typography key="wordsSetting" fontSize="small">
    Word
  </Typography>,
  <Typography key="errorsSetting" fontSize="small">
    Error
  </Typography>,
  <Typography key="errorsSetting" fontSize="small">
    Defender
  </Typography>,
];

const TextTypeIcons = [
  <Typography key="passageTextType" fontSize="small">
    Passage
  </Typography>,
  <Typography key="topWordsTextType" fontSize="small">
    Top Words
  </Typography>,
  <Typography key="numberTextType" fontSize="small">
    Numbers
  </Typography>,
];

export default function Settings() {
  const { gameSettings, setGameSettings } = useGameSettings();

  const SetMode = (inMode: number) => {
    setGameSettings({
      ...gameSettings,
      gameInfo: {
        ...gameSettings.gameInfo,
        type: inMode,
        amount: GameTypeAmounts[inMode][0],
      },
    });
  };

  const SetAmount = (inAmount: number) => {
    setGameSettings({
      ...gameSettings,
      gameInfo: { ...gameSettings.gameInfo, amount: inAmount },
    });
  };

  const SetTextType = (inTextType: number) => {
    setGameSettings({ ...gameSettings, textType: inTextType });
  };

  const TogglePracticeMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isPractice = event.target.checked;
    const { practice, ...gameInfo } = gameSettings.gameInfo;
    setGameSettings({
      ...gameSettings,
      gameInfo: {
        ...gameInfo,
        practice: { ...practice, isPractice },
      },
    });
  };

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "row", lg: "column" }}
      justifyContent="center"
      gap={3}
    >
      {/* {!(gameSettings.gameInfo.type === GameTypes.DEFENDER) ? (
        <GridCard>
          <Box display="flex" alignItems="center" gap={2}>
            <Switch
              checked={gameSettings.gameInfo.practice.isPractice}
              onChange={TogglePracticeMode}
            />
            <Typography>Practice Mode</Typography>
          </Box>
        </GridCard>
      ) : null} */}
      <GridCard padding={"10px 2px"} sx={{ textAlign: "center" }}>
        <Typography variant="subtitle2" marginBottom={1}>
          MODE
        </Typography>
        {GameTypeNames.map((name, index) => (
          <Button
            key={name}
            size="small"
            onClick={() => SetMode(index)}
            color={gameSettings.gameInfo.type === index ? "primary" : "inherit"}
          >
            {GameTypeIcons[index]}
          </Button>
        ))}
      </GridCard>
      {GameTypeAmounts[gameSettings.gameInfo.type].length > 0 ? (
        <GridCard padding={"10px 2px"} sx={{ textAlign: "center" }}>
          <Typography variant="subtitle2" marginBottom={1}>
            AMOUNT
          </Typography>
          {GameTypeAmounts[gameSettings.gameInfo.type].map((amount, index) => (
            <Button
              key={`${amount}_${index}`}
              onClick={() => SetAmount(amount)}
              size="small"
              color={
                gameSettings.gameInfo.amount === amount ? "primary" : "inherit"
              }
            >
              <Typography fontSize="small">{amount}</Typography>
            </Button>
          ))}
        </GridCard>
      ) : null}
      {!gameSettings.gameInfo.practice.isPractice &&
      gameSettings.gameInfo.type !== GameTypes.DEFENDER ? (
        <GridCard padding={"10px 2px"} sx={{ textAlign: "center" }}>
          <Typography variant="subtitle2" marginBottom={1}>
            TEXT TYPE
          </Typography>
          {TextTypeNames.map((name, index) => (
            <Button
              key={name}
              sx={{ marginX: 0.5 }}
              size="small"
              onClick={() => SetTextType(index)}
              color={gameSettings.textType === index ? "primary" : "inherit"}
            >
              {TextTypeIcons[index]}
            </Button>
          ))}
        </GridCard>
      ) : null}
    </Box>
  );
}

interface SettingSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SettingSection = ({
  title,
  description,
  children,
}: SettingSectionProps) => {
  return (
    <>
      <Box display="flex" gap={2} my={3}>
        <Box flexGrow={1}>
          <Typography color="secondary" display="inline" variant="subtitle1">
            {title}
          </Typography>
          {description ? (
            <Typography color="primary" variant="subtitle2">
              {description}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Box>
      <Divider />
    </>
  );
};

const FollowerSpeedSlider = ({ open }: { open: boolean }) => {
  const { gameSettings, setGameSettings } = useGameSettings();
  const [value, setValue] = React.useState<number | number[]>(
    gameSettings.display.followerSpeed
  );
  // const SetFollowerSpeed = (event: Event, newValue: number | number[]) => {
  //   const followerSpeed = (newValue as number) / 100 + 0.04;
  //   setGameSettings({
  //     ...gameSettings,
  //     display: { ...gameSettings.display, followerSpeed },
  //   });
  // };

  React.useEffect(() => {
    if (!open) {
      setGameSettings({
        ...gameSettings,
        display: {
          ...gameSettings.display,
          followerSpeed: value as number,
        },
      });
    }
  }, [open]);
  return (
    <Slider
      value={value}
      valueLabelDisplay="auto"
      marks
      step={0.02}
      min={0.04}
      max={0.2}
      onChange={(event: Event, newValue: number | number[]) =>
        setValue(newValue)
      }
      sx={{ maxWidth: 150 }}
    />
  );
};

interface SettingsDialogProps {
  open: boolean;
  setOpen: React.Dispatch<boolean>;
}

export const SettingsDialog = ({ open, setOpen }: SettingsDialogProps) => {
  const { gameSettings, setGameSettings } = useGameSettings();
  const OnStrictChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setGameSettings({
      ...gameSettings,
      gameInfo: { ...gameSettings.gameInfo, strict: value },
    });
  };

  const SetFollowerStyle = (_: unknown, followerStyle: FollowerTypes) => {
    setGameSettings({
      ...gameSettings,
      display: { ...gameSettings.display, followerStyle },
    });
  };

  const SetSmoothFollower = (event: React.ChangeEvent<HTMLInputElement>) => {
    const smoothFollower = event.target.checked;
    setGameSettings({
      ...gameSettings,
      display: { ...gameSettings.display, smoothFollower },
    });
  };

  const SetShowWPM = (event: React.ChangeEvent<HTMLInputElement>) => {
    const showWPM = event.target.checked;
    setGameSettings({
      ...gameSettings,
      display: { ...gameSettings.display, showWPM },
    });
  };

  const SetShowProfile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const showProfile = event.target.checked;
    setGameSettings({
      ...gameSettings,
      display: { ...gameSettings.display, showProfile },
    });
  };
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      sx={{ overflow: "scroll" }}
      maxWidth="lg"
      fullWidth
    >
      <Grid container spacing={2} p={2}>
        <Grid item xs={12} md={6}>
          <GridCard padding="30px">
            <Typography variant="h3">Display</Typography>
            <Divider sx={{ my: 1 }} />
            <SettingSection
              title="Smooth Follower"
              description="Follow text smoothly (disabling will increase performance)"
            >
              <Switch
                checked={gameSettings.display.smoothFollower}
                onChange={SetSmoothFollower}
              />
            </SettingSection>
            <SettingSection
              title="Smooth Follower Speed"
              description="How fast the smooth follower moves to the next character"
            >
              <FollowerSpeedSlider open={open} />
            </SettingSection>
            <SettingSection
              title="Follower Style"
              description="Change the look of the follower"
            >
              <ToggleButtonGroup
                color="primary"
                value={gameSettings.display.followerStyle}
                onChange={SetFollowerStyle}
                exclusive
              >
                {["Default", "|", "_"].map((name, index) => {
                  return (
                    <ToggleButton
                      key={`follower_${name}`}
                      value={index}
                      sx={{ minWidth: 50 }}
                    >
                      {name}
                    </ToggleButton>
                  );
                })}
              </ToggleButtonGroup>
            </SettingSection>
            <SettingSection
              title="Show WPM"
              description="Display WPM while the race is running"
            >
              <Switch
                checked={gameSettings.display.showWPM}
                onChange={SetShowWPM}
              />
            </SettingSection>
            <SettingSection
              title="Show Profile"
              description="Display profile on the home page"
            >
              <Switch
                checked={gameSettings.display.showProfile}
                onChange={SetShowProfile}
              />
            </SettingSection>
          </GridCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GridCard padding="30px" sx={{ height: "100%" }}>
            <Typography variant="h3">Game</Typography>
            <Divider sx={{ my: 1 }} />
            <SettingSection
              title="Strict"
              description="If you make a mistake you have to go back"
            >
              <Switch
                checked={gameSettings.gameInfo.strict}
                onChange={OnStrictChange}
              />
            </SettingSection>
          </GridCard>
        </Grid>
      </Grid>
    </Dialog>
  );
};
