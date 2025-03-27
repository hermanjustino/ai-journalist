import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <h2>About AAVE Analysis Platform</h2>
      
      <section className="about-section">
        <h3>Project Mission</h3>
        <p>
          The AAVE Analysis Platform autonomously tracks and analyzes African American Vernacular English 
          in academic publications and news media. By documenting the presence and evolution of AAVE in institutional 
          contexts, we provide data-driven insights into how Black linguistic contributions are recognized 
          and represented in formal discourse.
        </p>
      </section>
      
      <section className="about-section">
        <h3>How It Works</h3>
        <p>
          Our platform autonomously collects content from scholarly sources and news media on a daily basis. 
          Using natural language processing, we identify established AAVE linguistic features and analyze 
          their prevalence and context. The system generates visualizations that track patterns over time, 
          revealing how Black language evolves and gains recognition in institutional settings.
        </p>
      </section>
      
      <section className="about-section features-section">
        <h3>Key Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>Autonomous Data Collection</h4>
            <p>Daily automated gathering from academic and news sources</p>
          </div>
          <div className="feature-card">
            <h4>AAVE Pattern Recognition</h4>
            <p>Detection of specific linguistic features like copula deletion, habitual "be", and more</p>
          </div>
          <div className="feature-card">
            <h4>Source Comparison</h4>
            <p>Analysis of differences in AAVE representation between academic and news contexts</p>
          </div>
          <div className="feature-card">
            <h4>Trend Visualization</h4>
            <p>Interactive charts showing changing patterns over time</p>
          </div>
        </div>
      </section>
      
      <section className="about-section linguistic-section">
        <h3>AAVE Linguistic Features</h3>
        <p>
          We track specific established AAVE linguistic patterns, including:
        </p>
        <ul className="linguistic-list">
          <li><strong>Copula deletion</strong>: Omission of forms of "to be" (e.g., "he going")</li>
          <li><strong>Habitual "be"</strong>: Use of "be" to indicate recurring actions (e.g., "they be working")</li>
          <li><strong>Multiple negation</strong>: Using multiple negative forms (e.g., "don't know nothing")</li>
          <li><strong>Completive "done"</strong>: Using "done" to mark completed actions (e.g., "done finished")</li>
          <li><strong>Remote time "been"</strong>: Using stressed "been" to mark actions from the distant past (e.g., "been knew")</li>
        </ul>
      </section>
      
      <section className="about-section research-section">
        <h3>Research Foundation</h3>
        <p>
          This project builds upon linguistic research exploring the structures and patterns of AAVE, 
          particularly the work "LOW-RESOURCE LANGUAGE MODEL WITH CYBER DEFENSE" (2022).
        </p>
        <p>
          Our goal is to expand to other languages from the African diaspora globally, including Caribbean Creole languages, 
          West African dialects, Black British linguistic patterns, and Afro-Brazilian Portuguese variations.
        </p>
      </section>
      
      <section className="about-section tech-section">
        <h3>Technology Stack</h3>
        <div className="tech-grid">
          <div className="tech-category">
            <h4>Frontend</h4>
            <div className="tech-badges">
              <span className="tech-badge">React</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">Chart.js</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>Backend</h4>
            <div className="tech-badges">
              <span className="tech-badge">Node.js</span>
              <span className="tech-badge">Express.js</span>
              <span className="tech-badge">Python (scholarly)</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>Data Sources</h4>
            <div className="tech-badges">
              <span className="tech-badge">Google Scholar</span>
              <span className="tech-badge">News API</span>
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
          <a href="mailto:hermanjustino@gmail.com" className="contact-button">Contact Us</a>
          <a href="https://github.com/hermanjustino/ai-journalist" className="github-button">View on GitHub</a>
        </div>
      </section>
    </div>
  );
};

export default About;