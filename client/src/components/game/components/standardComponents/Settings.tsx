import React from "react";
import { useGameSettings } from "../../../../contexts/GameSettings";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { GridCard } from "../../../common";
import {
  GameTypeNames,
  GameTypeAmounts,
  TextTypeNames,
  DefaultGameSettings,
  FollowerTypes,
  GameTypes,
} from "../../../../constants/settings";
import {
  Box,
  Button,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

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
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
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

  const TogglePracticeMode = () => {
    const { practice, ...gameInfo } = gameSettings.gameInfo;
    setGameSettings({
      ...gameSettings,
      gameInfo: {
        ...gameInfo,
        practice: { ...practice, isPractice: !practice.isPractice },
      },
    });
  };

  const OnStrictChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setGameSettings({
      ...gameSettings,
      gameInfo: { ...gameSettings.gameInfo, strict: value },
    });
  };

  const SetFollowerStyle = (_: any, followerStyle: FollowerTypes) => {
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

  const SettingsDialog = React.useMemo(() => {
    return (
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
                <FollowerSpeedSlider open={dialogOpen} />
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
  }, [dialogOpen, gameSettings.display, gameSettings.gameInfo.strict]);

  return (
    <Grid container spacing={3}>
      {/* <Grid item xs={6}>
        <GridCard>
          <FormGroup>
            <FormControlLabel
              sx={{ flexDirection: "row", m: 0 }}
              control={
                <Switch
                  checked={gameSettings.gameInfo.strict}
                  onChange={OnStrictChange}
                />
              }
              label={<Typography>Strict</Typography>}
              labelPlacement="start"
            />
          </FormGroup>
        </GridCard>
      </Grid> */}
      {SettingsDialog}
      <Grid item xs={6}>
        <Box sx={{ width: "fit-content", paddingTop: 4 }}>
          <Tooltip title="Settings" placement="left">
            <IconButton onClick={() => setDialogOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <GridCard sx={{ textAlign: "center" }}>
          <Typography marginBottom={1}>MODE</Typography>
          {GameTypeNames.map((name, index) => (
            <Button
              key={name}
              sx={{ margin: 1 }}
              onClick={() => SetMode(index)}
              color={
                gameSettings.gameInfo.type === index ? "primary" : "inherit"
              }
            >
              {GameTypeIcons[index]}
            </Button>
          ))}
          {!(gameSettings.gameInfo.type === GameTypes.DEFENDER) ? (
            <Button
              variant="contained"
              sx={{ margin: 1 }}
              onClick={() => TogglePracticeMode()}
            >
              {gameSettings.gameInfo.practice.isPractice
                ? "Exit Practice"
                : "Practice Mode"}
            </Button>
          ) : null}
        </GridCard>
      </Grid>
      {GameTypeAmounts[gameSettings.gameInfo.type].length > 0 ? (
        <Grid item xs={12}>
          <GridCard sx={{ textAlign: "center" }}>
            <Typography marginBottom={1}>AMOUNT</Typography>
            {GameTypeAmounts[gameSettings.gameInfo.type].map(
              (amount, index) => (
                <Button
                  key={`${amount}_${index}`}
                  onClick={() => SetAmount(amount)}
                  color={
                    gameSettings.gameInfo.amount === amount
                      ? "primary"
                      : "inherit"
                  }
                >
                  <Typography fontSize="small">{amount}</Typography>
                </Button>
              )
            )}
          </GridCard>
        </Grid>
      ) : null}
      {!gameSettings.gameInfo.practice.isPractice &&
      gameSettings.gameInfo.type !== GameTypes.DEFENDER ? (
        <Grid item xs={12}>
          <GridCard sx={{ textAlign: "center" }}>
            <Typography marginBottom={1}>TEXT TYPE</Typography>
            {TextTypeNames.map((name, index) => (
              <Button
                key={name}
                onClick={() => SetTextType(index)}
                color={gameSettings.textType === index ? "primary" : "inherit"}
              >
                {TextTypeIcons[index]}
              </Button>
            ))}
          </GridCard>
        </Grid>
      ) : null}
    </Grid>
  );
}

interface SettingSectionProps {
  title: string;
  description?: string;
  children: any;
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
