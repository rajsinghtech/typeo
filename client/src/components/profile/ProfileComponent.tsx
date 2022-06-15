import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import MuiLink from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/system";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import { StyledTextField, SuccessAlert, ErrorAlert, GridCard } from "../common";

const StyledDiv = styled("div")(({ theme }) => ({
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
  fillDefaults?: {
    [x: string]: string;
  };
  children?: any;
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
  fillDefaults,
  children,
}: ProfileComponentProps) {
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
