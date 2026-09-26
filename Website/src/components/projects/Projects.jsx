import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import { PROJECTS } from '../../data/projects';
import { projectsApi } from '../../services/api';
import './Projects.css';

/**
 * Projects / Selected Work Section
 * Displays engineering case studies with full deliverables, technology stacks, and key work.
 * Seamlessly integrates published projects from MySQL database with static fallback.
 */
export default function Projects() {
  const [isVisible, setIsVisible] = useState(false);
  const [projectsList, setProjectsList] = useState(PROJECTS);
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    projectsApi.getPublished()
      .then((res) => {
        if (isMounted && res && Array.isArray(res.projects) && res.projects.length > 0) {
          const merged = res.projects.map((p, idx) => {
            const staticMatch = PROJECTS.find((sp) => sp.id === p.slug);
            return {
              id: p.slug,
              number: String(idx + 1).padStart(2, '0'),
              title: p.title,
              category: p.category,
              description: p.short_description || p.description,
              technologies: Array.isArray(p.technologies) ? p.technologies : [],
              keyWork: staticMatch?.keyWork || [
                'Architecture and system design',
                'Core algorithm implementation',
                'End-to-end integration and verification',
              ],
              case_study_route: p.case_study_route || `/work/${p.slug}`,
            };
          });
          setProjectsList(merged);
        }
      })
      .catch(() => {
        // Fallback to static PROJECTS if API unavailable
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className={`projects-section ${isVisible ? 'projects-section--visible' : ''}`}
      aria-labelledby="projects-heading"
    >
      <Container size="default">
        {/* Section Header */}
        <div className="projects__header">
          <div className="projects__marker" aria-hidden="true">
            <span className="projects__accent-line" />
          </div>

          <h2 id="projects-heading" className="projects__heading">
            Selected Work
          </h2>

          <p className="projects__subtitle">
            Projects where I applied software, backend, database, and machine-learning concepts to practical problems.
          </p>

          <div className="projects__playground-discovery">
            <Link to="/playground" className="projects__playground-link">
              <span>Try the Project Playground</span>
              <span className="projects__playground-arrow" aria-hidden="true">→</span>
            </Link>
            <span className="projects__discovery-sep" aria-hidden="true">•</span>
            <Link to="/behind-the-build" className="projects__playground-link">
              <span>Behind the Build</span>
              <span className="projects__playground-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Large Editorial Project Blocks (Vertical Stack) */}
        <div className="projects__list" role="region" aria-label="Selected Engineering Projects">
          {projectsList.map((project) => (
            <article key={project.id} className="project-card">
              {/* Top Meta: Number & Category */}
              <div className="project-card__meta">
                <span className="project-card__number">{project.number}</span>
                <span className="project-card__category">{project.category}</span>
              </div>

              {/* Title */}
              <h3 className="project-card__title">
                {project.title}
              </h3>

              {/* Description */}
              <p className="project-card__desc">
                {project.description}
              </p>

              {/* Technology Tags */}
              <div className="project-card__tags-section">
                <span className="project-card__section-label">STACK</span>
                <ul className="project-card__tags" aria-label={`Technologies used in ${project.title}`}>
                  {project.technologies.map((tech) => (
                    <li key={tech} className="project-card__tag">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Work Checklist */}
              <div className="project-card__keywork-section">
                <span className="project-card__section-label">KEY WORK</span>
                <ul className="project-card__keywork-list" aria-label={`Key work for ${project.title}`}>
                  {project.keyWork.map((item) => (
                    <li key={item} className="project-card__keywork-item">
                      <span className="project-card__check" aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Action */}
              <div className="project-card__footer">
                <Link
                  to={project.case_study_route || `/work/${project.id}`}
                  className="project-card__cta"
                  aria-label={`View Case Study for ${project.title}`}
                >
                  View Case Study →
                </Link>
                {['federated-learning-6g', 'luxury-hotel-management'].includes(project.id) && (
                  <Link
                    to={`/behind-the-build?project=${project.id}`}
                    className="project-card__build-link font-mono"
                    aria-label={`Explore Behind the Build for ${project.title}`}
                  >
                    Behind the Build →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
