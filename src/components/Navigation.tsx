import React from 'react';
import './Navigation.css';

interface Props {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<Props> = ({ currentView, onViewChange }) => {
  return (
    <nav className="main-navigation">
      <div className="brand">
        <h1>Cultural AI Journalist</h1>
      </div>
      <ul className="nav-links">
        <li className={currentView === 'aave-analysis' ? 'active' : ''}>
          <button onClick={() => onViewChange('aave-analysis')}>
            AAVE Analysis
          </button>
        </li>
        <li className={currentView === 'dashboard' ? 'active' : ''}>
          <button onClick={() => onViewChange('dashboard')}>
            Dashboard
          </button>
        </li>
        {/* Removed Insights navigation item */}
        <li className={currentView === 'trends' ? 'active' : ''}>
          <button onClick={() => onViewChange('trends')}>
            Trend Discovery
          </button>
        </li>
        <li className={currentView === 'articles' ? 'active' : ''}>
          <button onClick={() => onViewChange('articles')}>
            Article Generator
          </button>
        </li>
        <li className={currentView === 'about' ? 'active' : ''}>
          <button onClick={() => onViewChange('about')}>
            About
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;