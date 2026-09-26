import React from 'react';
import Hero from '../components/home/Hero';
import About from '../components/about/About';
import Skills from '../components/skills/Skills';
import Projects from '../components/projects/Projects';

/**
 * Home Page
 * Composed of verified sections: Hero, About / Who I Am, Skills / Technology Universe, and Projects / Selected Work
 */
export default function HomePage() {
  return (
    <div className="home-page">
      <Hero />
      <About />
      <Skills />
      <Projects />
    </div>
  );
}
