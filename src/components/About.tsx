import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <h2>About AAVE Discourse Analysis Platform</h2>
      
      <section className="about-section">
        <h3>Project Mission</h3>
        <p>
          The AAVE Discourse Analysis Platform tracks and analyzes academic publications and news media 
          that discuss African American Vernacular English (AAVE). Our mission is to provide data-driven 
          insights into how AAVE is portrayed, studied, and discussed in institutional contexts, revealing 
          trends in academic recognition and public discourse surrounding Black language.
        </p>
      </section>
      
      <section className="about-section">
        <h3>How It Works</h3>
        <p>
          Our platform autonomously collects articles and publications that mention or focus on AAVE from 
          scholarly sources and news media. Using natural language processing and sentiment analysis, we 
          evaluate how AAVE is discussed, the context in which it appears, and the overall tone of the discourse. 
          The system generates visualizations that track patterns over time, revealing evolving attitudes 
          toward Black linguistic contributions in academic and public spheres.
        </p>
      </section>
      
      <section className="about-section features-section">
        <h3>Key Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>Autonomous Article Collection</h4>
            <p>Daily automated gathering of AAVE-related content from academic and news sources</p>
          </div>
          <div className="feature-card">
            <h4>Sentiment Analysis</h4>
            <p>Evaluation of attitudes and perspectives in discourse about AAVE</p>
          </div>
          <div className="feature-card">
            <h4>Source Comparison</h4>
            <p>Analysis of differences between academic research and news coverage of AAVE</p>
          </div>
          <div className="feature-card">
            <h4>Trend Visualization</h4>
            <p>Interactive charts showing changing discourse patterns over time</p>
          </div>
        </div>
      </section>
      
      <section className="about-section linguistic-section">
        <h3>Discourse Analysis Categories</h3>
        <p>
          We categorize and analyze content discussing AAVE through multiple lenses:
        </p>
        <ul className="linguistic-list">
          <li><strong>Educational Context</strong>: How AAVE is discussed in educational settings and pedagogy</li>
          <li><strong>Linguistic Research</strong>: Academic papers analyzing AAVE structure and patterns</li>
          <li><strong>Cultural Recognition</strong>: Articles discussing AAVE's cultural significance and heritage</li>
          <li><strong>Social Commentary</strong>: Discourse on the social implications and reception of AAVE</li>
          <li><strong>Historical Documentation</strong>: Content examining the historical development of AAVE</li>
        </ul>
      </section>
      
      <section className="about-section research-section">
        <h3>Research Foundation</h3>
        <p>
          This project builds upon research in linguistics, media studies, and sentiment analysis to examine
          public and academic discourse about African American language. We consider how discussions about AAVE
          reflect broader cultural attitudes toward linguistic diversity and Black cultural expressions.
        </p>
        <p>
          Our goal is to provide an objective, data-driven view of the evolving conversation around AAVE in
          academia and public discourse, tracking citation patterns, sentiment trends, and topic evolution.
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
              <span className="tech-badge">NLP Libraries</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>Analysis</h4>
            <div className="tech-badges">
              <span className="tech-badge">Sentiment Analysis</span>
              <span className="tech-badge">Topic Modeling</span>
              <span className="tech-badge">Citation Analysis</span>
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