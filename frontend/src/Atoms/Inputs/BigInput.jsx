import React from "react";
import styled from "styled-components";

const StyledInput = styled.input`
  width: 272px;
  height: 34px;

  border: 2px solid ${({ theme }) => theme.color.darkgrey};
  border-radius: 8px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.color.black};
`;

export default function BigInput({ placehold, inputValue, type, value, disabled }) {
  return (
    <StyledInput
      type={type}
      className="body1-regular"
      onChange={inputValue}
      placeholder={placehold}
      value={value}
      disabled={disabled}
    ></StyledInput>
  );
}
