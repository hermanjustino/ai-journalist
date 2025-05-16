import React from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>AI Cultural Journalist</h1>
          <p className="subtitle">Advancing AAVE Research Through AI</p>
          <p className="description">
            Discover, analyze, and visualize African American Vernacular English research 
            trends and publications across academic and cultural domains.
          </p>
          <div className="cta-buttons">
            <button 
              className="primary-button" 
              onClick={() => onNavigate('dashboard')}
            >
              Explore Publications
            </button>
            <button 
              className="secondary-button"
              onClick={() => onNavigate('trends')}
            >
              Discover Trends
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="abstract-shape"></div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section">
        <h2>Powerful Research Tools</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon timeline-icon"></div>
            <h3>Publications Timeline</h3>
            <p>
              Browse through decades of AAVE research publications with interactive 
              visualizations and comprehensive metadata.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon trends-icon"></div>
            <h3>Trend Discovery</h3>
            <p>
              Identify emerging research topics and patterns using advanced NLP 
              algorithms to analyze publication content.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon sources-icon"></div>
            <h3>Source Analysis</h3>
            <p>
              Explore diverse sources of cultural content from academic journals 
              to news media and their impact on AAVE research.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon insights-icon"></div>
            <h3>Cultural Insights</h3>
            <p>
              Gain deeper understanding of how AAVE is represented and studied 
              across different cultural and academic domains.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-value">1000+</div>
          <div className="stat-label">Publications Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">50+</div>
          <div className="stat-label">Research Topics</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">70</div>
          <div className="stat-label">Years of Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">12</div>
          <div className="stat-label">Source Categories</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Start Exploring AAVE Research</h2>
        <p>
          Dive into the comprehensive collection of publications, trends, and insights 
          about African American Vernacular English studies.
        </p>
        <button 
          className="cta-button"
          onClick={() => onNavigate('publications-timeline')}
        >
          Get Started
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
