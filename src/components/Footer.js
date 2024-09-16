import React from "react";
import styled from "styled-components";
function Footer() {
  const year = new Date().getFullYear();
  return (
    <FooterContainer className="container">
      <hr />
      Created by bharathsvri
    </FooterContainer>
  );
}

const FooterContainer = styled.div`
  color: ${(props) => props.theme.text};

  hr {
    border: none;
    border-top: 1px solid grey;
    margin-bottom: 20px;
    padding: 0 2rem;
  }
  text-align: center;
  padding: 3%;
`;
export default Footer;
