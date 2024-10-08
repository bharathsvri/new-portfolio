import React from "react";
import styled from "styled-components";
import aboutSvg from "../assets/designer-boy.jpg";

function About() {
  return (
    <AboutContainer className="container">
      <div className="about-title title" id="about" data-aos="fade-right">
        About
      </div>

      <div className="about-content">
        <div className="about-description">
          <ul>
            <li>
              <p data-aos="fade-up">
              I'm a dedicated <span style={{ color: "var(--clr-violet)" }}>Software Developer</span> with a passion for crafting web applications that are pivotal to the overall success of the product.
              </p>
            </li>
            <li>
              <p data-aos="fade-up">
                I have hands-on experience with HTML5, CSS3, JavaScript and modern framework like Reactjs
              </p>
            </li>
            <li>
              <p data-aos="fade-up">
                I enjoy collaborating with teams, solving complex problems, and continuosly learning new technoloies to stay ahead in this ever-evolving field.
              </p>
            </li>
          </ul>
        </div>

        <div className="about-svg-wrapper" data-aos="fade-left">
          <img src={aboutSvg} alt="designer girl" className="about-svg" />
        </div>
      </div>
    </AboutContainer>
  );
}

const AboutContainer = styled.div`
  margin-bottom: 8%;
  color: ${(props) => props.theme.text};
  .about-title {
    text-align: left;
  }
  .about-svg {
    height: 450px;
    width: 350px;
    object-fit:cover;
    border-radius:20px;
    margin-bottom: 20px;
  }

  .about-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .about-description {
    width: 60%;
    padding:0 4%;
    font-size: 1.5rem;
  }

  .about-description ul li p {
    margin-bottom: 5%;
    &::before {
      content: "⚡";
    }
  }

  .about-svg-wrapper {
    text-align: center;
    width: 30%;
  }

  .about-description,
  .about-svg-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media screen and (max-width: 1020px) {
    .about-svg {
      height: 350px;
      width: 250px;
    }
    .about-content {
      flex-direction: column;
    }
    .about-svg-wrapper {
      order: 1;
      width: 100%;
    }
    .about-description {
      order: 2;
      width: 100%;
    }
  }

  @media screen and (max-width: 500px) {
    .about-description {
      padding: 0;
    }
    margin-bottom: 12%;
  }
`;

export default About;
