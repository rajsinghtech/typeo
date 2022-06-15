import React from "react";
import { Box } from "@mui/material";
import "./styles.css";

export default function Searching() {
  return (
    <Box width="100px" height="100px">
      <svg className="search" width="200" height="200" viewBox="0 0 100 100">
        <polyline
          className="line-cornered stroke-still"
          points="0,0 100,0 100,100"
          strokeWidth="10"
          fill="none"
        ></polyline>
        <polyline
          className="line-cornered stroke-still"
          points="0,0 0,100 100,100"
          strokeWidth="10"
          fill="none"
        ></polyline>
        <polyline
          className="line-cornered stroke-animation"
          points="0,0 100,0 100,100"
          strokeWidth="10"
          fill="none"
        ></polyline>
        <polyline
          className="line-cornered stroke-animation"
          points="0,0 0,100 100,100"
          strokeWidth="10"
          fill="none"
        ></polyline>
      </svg>
    </Box>
  );
}
