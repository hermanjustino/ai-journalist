import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <h2>About AI Cultural Journalist</h2>
      
      <section className="about-section">
        <h3>Project Mission</h3>
        <p>
          The AI Cultural Journalist project aims to track, analyze, and highlight Black cultural contributions
          across multiple domains. By leveraging technology to identify trends and connections,
          we create a dynamic cultural observatory that celebrates and documents the evolution of Black culture.
        </p>
      </section>
      
      <section className="about-section">
        <h3>How It Works</h3>
        <p>
          Our platform aggregates content from social media, news sources, and cultural publications.
          Using natural language processing and machine learning, we categorize content into defined
          cultural domains and track emerging trends and patterns. This allows us to provide insights
          into how Black culture evolves, influences, and transforms society.
        </p>
      </section>
      
      <section className="about-section">
        <h3>Cultural Domains</h3>
        <p>
          We currently track five primary cultural domains:
        </p>
        <ul className="domains-list">
          <li><strong>Music</strong>: Hip-Hop/Rap, Jazz, R&B/Soul, Gospel</li>
          <li><strong>Social Justice & Activism</strong>: Civil Rights, Black Liberation, Contemporary Movements</li>
          <li><strong>Language & Expression</strong>: AAVE, Slang & Terminology</li>
          <li><strong>Arts & Literature</strong>: Literature, Visual Arts</li>
          <li><strong>Innovation & Technology</strong>: Tech Pioneers, STEM</li>
        </ul>
      </section>
      
      <section className="about-section">
        <h3>Technology Stack</h3>
        <p>
          This application is built using:
        </p>
        <ul>
          <li>React</li>
          <li>TypeScript</li>
          <li>Social Media APIs</li>
          <li>News APIs</li>
        </ul>
      </section>
      
      <section className="about-section contact">
        <h3>Contact</h3>
        <p>
          For questions, suggestions, or collaboration opportunities, please reach out to us.
        </p>
        <a href="mailto:contact@aiculturaljournalist.com" className="contact-button">Contact Us</a>
      </section>
    </div>
  );
};

export default About;