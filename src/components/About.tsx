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
      
      <section className="about-section domains-section">
        <h3>Cultural Domains</h3>
        <p>
          We track five primary cultural domains with specific focus areas:
        </p>
        <div className="domains-grid">
          <div className="domain-card">
            <h4>Music</h4>
            <ul className="domain-list">
              <li>Hip-Hop/Rap</li>
              <li>Jazz</li>
              <li>R&B/Soul</li>
              <li>Gospel</li>
            </ul>
          </div>
          <div className="domain-card">
            <h4>Social Justice & Activism</h4>
            <ul className="domain-list">
              <li>Civil Rights</li>
              <li>Black Liberation</li>
              <li>Contemporary Movements</li>
            </ul>
          </div>
          <div className="domain-card">
            <h4>Language & Expression</h4>
            <ul className="domain-list">
              <li>AAVE</li>
              <li>Slang & Terminology</li>
            </ul>
          </div>
          <div className="domain-card">
            <h4>Arts & Literature</h4>
            <ul className="domain-list">
              <li>Literature</li>
              <li>Visual Arts</li>
            </ul>
          </div>
          <div className="domain-card">
            <h4>Innovation & Technology</h4>
            <ul className="domain-list">
              <li>Tech Pioneers</li>
              <li>STEM</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="about-section tech-section">
        <h3>Technology Stack</h3>
        <div className="tech-grid">
          <div className="tech-category">
            <h4>Frontend</h4>
            <div className="tech-badges">
              <span className="tech-badge">React</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">CSS</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>Backend</h4>
            <div className="tech-badges">
              <span className="tech-badge">Express.js</span>
              <span className="tech-badge">Node.js</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>APIs</h4>
            <div className="tech-badges">
              <span className="tech-badge">Twitter API</span>
              <span className="tech-badge">News API</span>
              <span className="tech-badge">TikTok API</span>
            </div>
          </div>
        </div>
      </section>
      
      <section className="about-section contact">
        <h3>Contact</h3>
        <p>
          For questions, suggestions, or collaboration opportunities, please reach out to us.
        </p>
        <div className="contact-actions">
          <a href="mailto:contact@aiculturaljournalist.com" className="contact-button">Contact Us</a>
          <a href="https://github.com/yourusername/bhm" className="github-button">View on GitHub</a>
        </div>
      </section>
    </div>
  );
};

export default About;