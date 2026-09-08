import React from "react";
import styled from "styled-components";
import { FaCalendarAlt, FaLayerGroup } from "react-icons/fa";
import { HiOutlineServer } from "react-icons/hi";

const projectsData = [
  {
    title: "Forex Card Management System",
    category: "Financial Enterprise Platform",
    duration: "16-06-2025 – 29-12-2025",
    description:
      "Enterprise financial management platform for forex card issuance, transaction tracking, and balance management.",
    points: [
      "Architected and developed high-throughput backend microservices using Java, Spring Boot, and PostgreSQL.",
      "Configured AWS CloudWatch and AWS CLI for deep metrics inspection, error logs, and system health checks.",
      "Designed real-time Grafana dashboards for proactive transaction and infrastructure monitoring.",
      "Maintained structured release cycles and issue tracking using GitLab and JIRA.",
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "PostgreSQL",
      "AWS CloudWatch",
      "AWS CLI",
      "Grafana",
      "GitLab",
      "JIRA",
    ],
  },
  {
    title: "Construction Management Application",
    category: "Operations & Resource Management",
    duration: "27-04-2026 – 20-08-2026",
    description:
      "Comprehensive construction and operations management application delivering scalable workflows and project resource tracking.",
    points: [
      "Developed robust full-stack features leveraging Java on the backend and Vue.js on the frontend.",
      "Implemented responsive user interfaces for site tracking, milestones, and material allocation.",
      "Integrated secure REST APIs ensuring consistent data synchronization across distributed construction sites.",
      "Coordinated with cross-functional teams utilizing GitLab version control and JIRA agile boards.",
    ],
    techStack: ["Java", "Spring Boot", "Vue.js", "GitLab", "JIRA"],
  },
  {
    title: "Customer Complaint Management System",
    category: "Customer Experience & Service Platform",
    duration: "20-01-2026 – 31-03-2026",
    description:
      "Enterprise-grade complaint ticketing and resolution ecosystem integrated with SAP Mashup and Microsoft Azure cloud services.",
    points: [
      "Built and maintained mission-critical service modules using Java, Spring Boot, and Angular.",
      "Implemented SAP Mashup Integration to synchronize real-time CRM and customer records.",
      "Employed Azure Data Lake for structured analytical storage and reporting.",
      "Configured automated build and deployment workflows with Azure DevOps, Azure CI/CD, and Azure App Service.",
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "Angular",
      "SAP Mashup",
      "Azure Data Lake",
      "Azure DevOps",
      "Azure CI/CD",
      "Azure App Service",
    ],
  },
  {
    title: "Human Resource Management (HRM) System",
    category: "Enterprise HR & Operations",
    duration: "Enterprise Project",
    description:
      "Internal enterprise HRM solution managing employee profiles, payroll processing, leave requests, and performance workflows.",
    points: [
      "Developed resilient backend endpoints and business logic using Java, Spring Boot, and PostgreSQL.",
      "Created structured database schemas and optimized relational queries for rapid data retrieval.",
      "Streamlined team collaboration and sprint delivery using Bitbucket and JIRA.",
    ],
    techStack: ["Java", "Spring Boot", "PostgreSQL", "Bitbucket", "JIRA"],
  },
];

function Projects() {
  return (
    <ProjectsContainer className="container">
      <div className="project-title title" id="projects" data-aos="fade-left">
        Project Experience
      </div>

      <div className="projects-grid">
        {projectsData.map((project, index) => (
          <ProjectCard
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 150}
          >
            <div className="card-top">
              <div className="card-badge">
                <FaLayerGroup className="badge-icon" />
                <span>{project.category}</span>
              </div>
              <div className="card-duration">
                <FaCalendarAlt className="duration-icon" />
                <span>{project.duration}</span>
              </div>
            </div>

            <div className="card-header">
              <div className="project-icon">
                <HiOutlineServer />
              </div>
              <h3 className="project-heading">{project.title}</h3>
            </div>

            <p className="project-summary">{project.description}</p>

            <ul className="project-points">
              {project.points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>

            <div className="project-footer">
              <div className="tech-label">Technologies:</div>
              <div className="tech-tags">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="tech-pill">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </ProjectCard>
        ))}
      </div>
    </ProjectsContainer>
  );
}

const ProjectsContainer = styled.div`
  margin-bottom: 8%;
  color: ${(props) => props.theme.text};
  width: 90%;
  margin: 0 auto 8% auto;

  .project-title {
    text-align: right;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    width: 85%;
    margin: 0 auto;
  }

  @media screen and (max-width: 1100px) {
    .projects-grid {
      grid-template-columns: 1fr;
      width: 90%;
    }
  }

  @media screen and (max-width: 600px) {
    .projects-grid {
      width: 100%;
      gap: 1.5rem;
    }
  }
`;

const ProjectCard = styled.div`
  background: ${(props) =>
    props.theme.bg === "var(--dark-bg)"
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(0, 0, 0, 0.03)"};
  border: 1px solid
    ${(props) =>
      props.theme.bg === "var(--dark-bg)"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)"};
  border-radius: 14px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 196, 255, 0.25);
    border-color: rgba(0, 196, 255, 0.4);
    transform: translateY(-4px);
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.2rem;
  }

  .card-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(115, 52, 209, 0.15);
    color: var(--clr-violet);
    padding: 0.3rem 0.7rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .card-duration {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: ${(props) => props.theme.heroDescription};
    font-size: 0.85rem;
    font-weight: 500;

    .duration-icon {
      color: var(--clr-blue);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .project-icon {
    font-size: 1.6rem;
    color: var(--clr-blue);
    background: rgba(0, 196, 255, 0.12);
    height: 42px;
    width: 42px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
  }

  .project-heading {
    color: ${(props) => props.theme.text};
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0;
  }

  .project-summary {
    color: ${(props) => props.theme.heroDescription};
    font-size: 0.98rem;
    line-height: 1.5;
    margin-bottom: 1.2rem;
  }

  .project-points {
    list-style-type: none;
    padding-left: 0;
    margin-bottom: 1.5rem;
    flex-grow: 1;

    li {
      position: relative;
      padding-left: 1.4rem;
      margin-bottom: 0.6rem;
      font-size: 0.93rem;
      line-height: 1.5;
      color: ${(props) => props.theme.heroDescription};

      &::before {
        content: "▹";
        position: absolute;
        left: 0;
        color: var(--clr-violet);
        font-weight: bold;
      }
    }
  }

  .project-footer {
    border-top: 1px dashed
      ${(props) =>
        props.theme.bg === "var(--dark-bg)"
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0, 0, 0, 0.12)"};
    padding-top: 1rem;
  }

  .tech-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${(props) => props.theme.heroDescription};
    margin-bottom: 0.5rem;
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tech-pill {
    background: ${(props) =>
      props.theme.bg === "var(--dark-bg)"
        ? "rgba(255, 255, 255, 0.07)"
        : "rgba(0, 0, 0, 0.05)"};
    color: ${(props) => props.theme.text};
    border: 1px solid
      ${(props) =>
        props.theme.bg === "var(--dark-bg)"
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0, 0, 0, 0.12)"};
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--clr-blue);
      color: var(--clr-blue);
    }
  }

  @media screen and (max-width: 600px) {
    padding: 1.4rem;

    .project-heading {
      font-size: 1.15rem;
    }
  }
`;

export default Projects;
