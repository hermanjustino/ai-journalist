import React, { useState } from 'react';
import './Navigation.css';

interface NavigationProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

const Navigation: React.FC<NavigationProps> = ({ onViewChange, currentView }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavClick = (view: string) => {
    onViewChange(view);
    setMenuOpen(false);
  };

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-brand">AI Cultural Journalist</div>

        <div className={`hamburger-menu ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <li
          className={currentView === 'about' ? 'active' : ''}
          onClick={() => handleNavClick('about')}
        >
          About
        </li>
        <li
          className={currentView === 'domains' ? 'active' : ''}
          onClick={() => handleNavClick('domains')}
        >
          Cultural Domains
        </li>
        <li
          className={currentView === 'dashboard' ? 'active' : ''}
          onClick={() => handleNavClick('dashboard')}
        >
          Dashboard
        </li>
        <li
          className={currentView === 'insights' ? 'active' : ''}
          onClick={() => handleNavClick('insights')}
        >
          Insights
        </li>
        <li
          className={currentView === 'aave-analysis' ? 'active' : ''}
          onClick={() => handleNavClick('aave-analysis')}
        >
          AAVE Analysis
        </li>
        <li
          className={currentView === 'trends' ? 'active' : ''}
          onClick={() => handleNavClick('trends')}
        >
          Trend Discovery
        </li>
        <li
          className={currentView === 'articles' ? 'active' : ''}
          onClick={() => handleNavClick('articles')}
        >
          Articles
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;