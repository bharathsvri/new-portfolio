import React from "react";
import styled from "styled-components";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import mitrahLogo from "../assets/mitrahsoft_logo.jpg";
import { getExperienceYears } from "../utils/experience";

function Experience() {
  return (
    <ExperienceContainer className="container">
      <div
        className="experience-title title"
        id="experience"
        data-aos="fade-right"
      >
        Experience
      </div>

      <div className="experience-content">
        <ExpCard data-aos="fade-up">
          <div className="exp-header">
            <div className="exp-role-company">
              <div className="company-logo-wrapper">
                <img
                  src={mitrahLogo}
                  alt="MitrahSoft Solutions Logo"
                  className="company-logo"
                />
              </div>
              <div>
                <h3 className="exp-role">Software Developer (Full Stack Developer)</h3>
                <h4 className="exp-company">MitrahSoft Solutions Pvt. Ltd.</h4>
              </div>
            </div>
            <div className="exp-meta">
              <span className="exp-meta-item">
                <FaCalendarAlt className="meta-icon" /> March 2025 – Present ({getExperienceYears()} Years)
              </span>
              <span className="exp-meta-item">
                <FaMapMarkerAlt className="meta-icon" /> Kovilpatti, Tamil Nadu
              </span>
            </div>
          </div>

          <div className="exp-description">
            <p className="exp-summary">
              Joined MitrahSoft Solutions on March 19, 2025 as a Java Developer and transitioned into a Full Stack Developer, contributing to scalable and business-critical applications across multiple domains.
            </p>
            <ul className="exp-points">
              <li>
                Designed and built robust enterprise backend services using <strong>Java</strong>, <strong>Spring Boot</strong>, and <strong>Spring MVC</strong>.
              </li>
              <li>
                Developed responsive, dynamic user interfaces utilizing <strong>Vue.js</strong> and <strong>Angular</strong>.
              </li>
              <li>
                Engineered efficient database schemas, stored procedures, and complex queries in <strong>PostgreSQL</strong>.
              </li>
              <li>
                Configured and maintained cloud monitoring and infrastructure with <strong>AWS CloudWatch</strong>, <strong>AWS CLI</strong>, <strong>Azure App Service</strong>, and <strong>Grafana</strong>.
              </li>
              <li>
                Participated in agile ceremonies, CI/CD pipeline deployments, and sprint management with <strong>GitLab</strong>, <strong>Bitbucket</strong>, <strong>Azure DevOps</strong>, and <strong>JIRA</strong>.
              </li>
            </ul>
          </div>

          <div className="exp-techstack">
            <span className="techstack-label">Core Technologies:</span>
            <div className="techstack-tags">
              <span className="tech-tag">Java</span>
              <span className="tech-tag">Spring Boot</span>
              <span className="tech-tag">Spring MVC</span>
              <span className="tech-tag">Vue.js</span>
              <span className="tech-tag">Angular</span>
              <span className="tech-tag">PostgreSQL</span>
              <span className="tech-tag">AWS CloudWatch</span>
              <span className="tech-tag">Azure DevOps</span>
              <span className="tech-tag">Grafana</span>
              <span className="tech-tag">GitLab</span>
              <span className="tech-tag">JIRA</span>
            </div>
          </div>
        </ExpCard>
      </div>
    </ExperienceContainer>
  );
}

const ExperienceContainer = styled.div`
  margin-bottom: 8%;
  color: ${(props) => props.theme.text};
  width: 90%;
  margin: 0 auto 8% auto;

  .experience-title {
    text-align: left;
  }

  .experience-content {
    display: flex;
    flex-direction: column;
    width: 80%;
    margin: auto;
  }

  @media screen and (max-width: 850px) {
    .experience-content {
      width: 95%;
    }
  }
`;

const ExpCard = styled.div`
  background: ${(props) =>
    props.theme.bg === "var(--dark-bg)"
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(0, 0, 0, 0.03)"};
  border: 1px solid
    ${(props) =>
      props.theme.bg === "var(--dark-bg)"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)"};
  border-left: 5px solid var(--clr-blue);
  border-radius: 12px;
  padding: 2.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &:hover {
    box-shadow: 0 6px 25px rgba(0, 196, 255, 0.2);
    transform: translateY(-3px);
  }

  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px dashed
      ${(props) =>
        props.theme.bg === "var(--dark-bg)"
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(0, 0, 0, 0.15)"};
    padding-bottom: 1.2rem;
  }

  .exp-role-company {
    display: flex;
    align-items: center;
    gap: 1.2rem;
  }

  .company-logo-wrapper {
    background: #ffffff;
    height: 56px;
    width: 56px;
    border-radius: 12px;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    overflow: hidden;

    .company-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .exp-role {
    color: ${(props) => props.theme.text};
    font-size: 1.4rem;
    margin-bottom: 0.2rem;
  }

  .exp-company {
    color: var(--clr-blue);
    font-size: 1.15rem;
    font-weight: 500;
  }

  .exp-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.4rem;
  }

  .exp-meta-item {
    font-size: 0.95rem;
    color: ${(props) => props.theme.heroDescription};
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .meta-icon {
      color: var(--clr-violet);
    }
  }

  .exp-description {
    margin-bottom: 1.5rem;
  }

  .exp-summary {
    font-size: 1.1rem;
    color: ${(props) => props.theme.text};
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .exp-points {
    padding-left: 1.2rem;
    list-style-type: none;

    li {
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.8rem;
      font-size: 1.05rem;
      line-height: 1.5;
      color: ${(props) => props.theme.heroDescription};

      &::before {
        content: "▹";
        position: absolute;
        left: 0;
        color: var(--clr-blue);
        font-weight: bold;
      }

      strong {
        color: ${(props) => props.theme.text};
      }
    }
  }

  .exp-techstack {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .techstack-label {
    font-size: 0.95rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--clr-violet);
  }

  .techstack-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .tech-tag {
    background: ${(props) =>
      props.theme.bg === "var(--dark-bg)"
        ? "rgba(0, 196, 255, 0.12)"
        : "rgba(0, 196, 255, 0.15)"};
    color: var(--clr-blue);
    border: 1px solid rgba(0, 196, 255, 0.3);
    padding: 0.35rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background: var(--clr-blue);
      color: white;
    }
  }

  @media screen and (max-width: 768px) {
    padding: 1.5rem;

    .exp-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .exp-meta {
      align-items: flex-start;
    }

    .exp-role {
      font-size: 1.2rem;
    }

    .exp-company {
      font-size: 1rem;
    }
  }
`;

export default Experience;
