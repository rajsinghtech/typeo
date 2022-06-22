import React from "react";
import Follower from "../../feedback/Follower";
import { Box } from "@mui/material";
import { styled } from "@mui/system";

interface Props {
  words: Array<string>;
  boxRef: React.MutableRefObject<any>;
}

const StyledTextArea = styled("div")(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  fontSize: "20pt",
  lineHeight: "0.95em",
  textAlign: "left",
}));

const StyledWord = styled("div")(({ theme }) => ({
  display: "inline-block",
  padding: "0 0 0 0",
  margin: "0.2em 0",
}));

interface WordBoxProps {
  words: string[];
  boxRef: any;
}

export default React.memo(function WordBox({ words, boxRef }: WordBoxProps) {
  let char_count = 0;
  return (
    <Box
      mx={5}
      mt={5}
      mb={1}
      overflow="hidden"
      height="8.1em"
      fontSize="20pt"
      textAlign="left"
    >
      <StyledTextArea ref={boxRef}>
        {words.map((word, index) => {
          return (
            <StyledWord key={`word_${char_count++}`}>
              {word.split("").map((letter, index) => {
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
