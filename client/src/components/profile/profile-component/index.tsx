import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import {
  StyledTextField,
  SuccessAlert,
  ErrorAlert,
  GridCard,
} from "components/common";
import { styled } from "@mui/system";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  Avatar,
  Button,
  Link as MuiLink,
  Grid,
  Typography,
  Collapse,
  Container,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const StyledDiv = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 24,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.secondary.main,
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%", // Fix IE 11 issue.
  marginTop: theme.spacing(1),
}));

interface Field {
  name: string;
  type: string;
  label: string;
  autoComplete: string;
}

interface ProfileComponentProps {
  name: string;
  errorOpen?: boolean;
  error?: string;
  messageOpen?: boolean;
  message?: string;
  loading?: boolean;
  fields: Array<Field>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  signupLink?: boolean;
  loginLink?: boolean;
  forgotPasswordLink?: boolean;
  alternateLogins?: boolean;
  fillDefaults?: {
    [x: string]: string | null;
  };
  children?: React.ReactNode;
}

export default function ProfileComponent({
  name,
  errorOpen,
  error,
  messageOpen,
  message,
  loading,
  fields,
  handleSubmit,
  signupLink,
  loginLink,
  forgotPasswordLink,
  alternateLogins,
  fillDefaults,
  children,
}: ProfileComponentProps) {
  const theme = useTheme();
  const xsScreenSize = useMediaQuery(theme.breakpoints.down("vs"));

  const { googleLogin, facebookLogin, githubLogin } = useAuth();

  return (
    <Container component="main" maxWidth="sm">
      <GridCard sx={{ marginTop: 10 }}>
        <StyledDiv>
          <StyledAvatar>
            <LockOutlinedIcon />
          </StyledAvatar>
          <Typography component="h1" variant="h5">
            {name}
          </Typography>
          <Collapse in={errorOpen}>
            <ErrorAlert severity="error">{error}</ErrorAlert>
          </Collapse>
          <Collapse in={messageOpen}>
            <SuccessAlert severity="success">{message}</SuccessAlert>
          </Collapse>
          {alternateLogins ? (
            <Stack
              spacing={2}
              direction={xsScreenSize ? "column" : "row"}
              width="100%"
              mt={4}
            >
              {[
                {
                  name: "GOOGLE",
                  icon: <GoogleIcon />,
                  colors: ["white", "red", "#ffebeb"],
                  click: googleLogin,
                },
                {
                  name: "FACEBOOK",
                  icon: <FacebookIcon />,
                  colors: ["#4267B2", "white", "#5473b0"],
                  click: facebookLogin,
                },
                {
                  name: "GITHUB",
                  icon: <GitHubIcon />,
                  colors: ["#2e2e2e", "white", "#595959"],
                  click: githubLogin,
                },
              ].map(({ name, icon, colors, click }) => {
                return (
                  <Button
                    key={`alternate_${name}`}
                    variant="contained"
                    size="large"
                    startIcon={xsScreenSize ? null : icon}
                    disabled={name === "FACEBOOK"}
                    sx={{
                      flexGrow: 1,
                      background: colors[0],
                      color: colors[1],
                      "&:hover": { background: colors[2] },
                    }}
                    onClick={click}
                  >
                    {xsScreenSize ? icon : name}
                  </Button>
                );
              })}
            </Stack>
          ) : null}
          <StyledForm onSubmit={handleSubmit} noValidate>
            {fields.map((val, i) => {
              return (
                <StyledTextField
                  key={`${val.name}_${i}`}
                  margin="normal"
                  required
                  fullWidth
                  id={val.name}
                  label={val.label}
                  type={val.type}
                  name={val.name}
                  defaultValue={
                    fillDefaults && fillDefaults[val.name]
                      ? fillDefaults[val.name]
                      : ""
                  }
                  autoComplete={val.autoComplete}
                  autoFocus={i === 0}
                />
              );
            })}
            {children}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              <Typography>{name}</Typography>
            </Button>
          </StyledForm>
          <Grid
            container
            mt={4}
            display={
              !forgotPasswordLink && !loginLink && !signupLink
                ? "none"
                : "inherit"
            }
          >
            {forgotPasswordLink ? (
              <Grid item xs>
                <MuiLink
                  to="/forgot-password"
                  component={Link}
                  color="secondary"
                  sx={{ textUnderlineOffset: 3 }}
                >
                  {"Forgot password?"}
                </MuiLink>
              </Grid>
            ) : null}
            {loginLink ? (
              <Grid item xs>
                <MuiLink
                  to="/login"
                  component={Link}
                  color="secondary"
                  sx={{ textUnderlineOffset: 3 }}
                >
                  {"Already have an account? Login"}
                </MuiLink>
              </Grid>
            ) : null}
            {signupLink ? (
              <Grid item>
                <MuiLink
                  to="/signup"
                  component={Link}
                  color="secondary"
                  sx={{ textUnderlineOffset: 3 }}
                >
                  {"Don't have an account? Sign Up"}
                </MuiLink>
              </Grid>
            ) : null}
          </Grid>
        </StyledDiv>
      </GridCard>
    </Container>
  );
}
