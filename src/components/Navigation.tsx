import React, { useState } from 'react';
import './Navigation.css';

interface Props {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<Props> = ({ currentView, onViewChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleViewChange = (view: string) => {
    onViewChange(view);
    setMenuOpen(false); // Close menu when a view is selected
  };

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="brand">
          <h1>Cultural AI Journalist</h1>
        </div>
        
        {/* Hamburger menu for mobile */}
        <div 
          className={`hamburger-menu ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li className={currentView === 'aave-analysis' ? 'active' : ''}>
            <button onClick={() => handleViewChange('aave-analysis')}>
              AAVE Analysis
            </button>
          </li>
          <li className={currentView === 'dashboard' ? 'active' : ''}>
            <button onClick={() => handleViewChange('dashboard')}>
              Dashboard
            </button>
          </li>
          <li className={currentView === 'trends' ? 'active' : ''}>
            <button onClick={() => handleViewChange('trends')}>
              Trend Discovery
            </button>
          </li>
          <li className={currentView === 'publications-timeline' ? 'active' : ''}>
            <button onClick={() => handleViewChange('publications-timeline')}>
              Publications
            </button>
          </li>
          <li className={currentView === 'about' ? 'active' : ''}>
            <button onClick={() => handleViewChange('about')}>
              About
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;