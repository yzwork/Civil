import * as React from "react";
import styled from "styled-components";

const StyledPath = styled.path`
  fill: #23282d;
`;

export const NorthEastArrow = (): JSX.Element => {
  return (
    <svg height="11" viewBox="0 0 11 11" width="11" xmlns="http://www.w3.org/2000/svg">
      <StyledPath
        d="m10.098 7.998h-1.279v-4.823l-6.914 6.923-.905-.905 6.923-6.915h-4.823v-1.278h6.998z"
        fillRule="evenodd"
      />
    </svg>
  );
};
