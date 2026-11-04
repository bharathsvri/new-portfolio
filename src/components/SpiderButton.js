import React from "react";
import styled from "styled-components";
import { GiSpiderAlt } from "react-icons/gi";

function SpiderButton({ toggleSpider, isSpiderActive }) {
  return (
    <SpiderBtn
      onClick={toggleSpider}
      title={isSpiderActive ? "Hide Spider Cursor" : "Show Spider Cursor"}
      $isActive={isSpiderActive}
      aria-label="Toggle Spider Cursor"
    >
      <GiSpiderAlt />
    </SpiderBtn>
  );
}

const SpiderBtn = styled.button`
  position: fixed;
  bottom: 2.5rem;
  right: 8.5rem;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$isActive ? "white" : "rgba(255, 255, 255, 0.4)"};
  color: ${(props) => (props.$isActive ? "#00C4FF" : "#888")};
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  transition: all 0.4s ease;
  z-index: 10000;

  &:hover {
    box-shadow: 0 0 18px 4px var(--clr-blue);
    transform: scale(1.05);
  }

  svg {
    font-size: 1.7rem;
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$isActive ? "rotate(0deg)" : "rotate(-30deg)")};
  }

  @media screen and (max-width: 720px) {
    bottom: 1.5rem;
    right: 3.2rem;
    height: 1.8rem;
    width: 1.8rem;
    svg {
      font-size: 1.1rem;
    }
  }
`;

export default SpiderButton;
