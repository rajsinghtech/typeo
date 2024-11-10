import React from "react";
import { GameSettings, RaceTypes } from "constants/settings";
import { styled } from "@mui/system";
import { Box } from "@mui/material";

const StyledTextArea = styled("div")(() => ({
  position: "relative",
  display: "inline-block",
  fontSize: { xs: "16pt", sm: "18pt", lg: "20pt" },
  lineHeight: "0.95em",
}));

const StyledWord = styled("div")(() => ({
  display: "inline-block",
  padding: "0 0 0 0",
  margin: "0.2em 0",
}));

interface WordBoxProps {
  words: string[];
  boxRef: React.RefObject<HTMLDivElement>;
  settings?: GameSettings;
  textAlign?: "left" | "center" | "right";
}

export default React.memo(function WordBox({
  words,
  boxRef,
  textAlign,
  settings,
}: WordBoxProps) {
  let char_count = 0;
  return (
    <Box
      mx={{ xs: 2, sm: 3, md: 5 }}
      mt={{ xs: 2, sm: 3, md: 5 }}
      mb={settings?.raceType === RaceTypes.ONLINE ? { xs: 2, sm: 3, md: 5 } : 1}
      overflow="hidden"
      minHeight="8.1em"
      height={settings?.raceType === RaceTypes.ONLINE ? "fit-content" : "8.1em"}
      fontSize={{ xs: "16pt", sm: "18pt", lg: "20pt" }}
      textAlign={textAlign || "left"}
    >
      <StyledTextArea ref={boxRef}>
        {words.map((word) => {
          return (
            <StyledWord key={`word_${char_count++}`}>
              {word.split("").map((letter) => {
                return (
                  <div
                    key={char_count++}
                    style={{ display: "inline-block" }}
                    //ref={char_count === currentCharIndex ? measuredRef : null}
                  >
                    {letter}
                  </div>
                );
              })}
              <div
                style={{ display: "inline-block" }}
                //ref={char_count + 1 === currentCharIndex ? measuredRef : null}
              >
                &nbsp;
              </div>
            </StyledWord>
          );
        })}
      </StyledTextArea>
    </Box>
  );
});
