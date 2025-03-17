import React from 'react';
import './Navigation.css';

interface NavigationProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

const Navigation: React.FC<NavigationProps> = ({ onViewChange, currentView }) => {
  return (
    <nav className="main-navigation">
      <div className="nav-brand">AI Cultural Journalist</div>

      <ul className="nav-links">
        <li
          className={currentView === 'domains' ? 'active' : ''}
          onClick={() => onViewChange('domains')}
        >
          Cultural Domains
        </li>
        <li
          className={currentView === 'dashboard' ? 'active' : ''}
          onClick={() => onViewChange('dashboard')}
        >
          Dashboard
        </li>
        <li
          className={currentView === 'insights' ? 'active' : ''}
          onClick={() => onViewChange('insights')}
        >
          Insights
        </li>
        <li
          className={currentView === 'collection' ? 'active' : ''}
          onClick={() => onViewChange('collection')}
        >
          Data Collection
        </li>
        <li
          className={currentView === 'about' ? 'active' : ''}
          onClick={() => onViewChange('about')}
        >
          About
        </li>
        <li
          className={currentView === 'api-test' ? 'active' : ''}
          onClick={() => onViewChange('api-test')}
        >
          API Test
        </li>
        <li
          className={currentView === 'api-usage' ? 'active' : ''}
          onClick={() => onViewChange('api-usage')}
        >
          API Usage
        </li>
      </ul>

      <div className="nav-search">
        <input type="text" placeholder="Search content..." />
        <button>Search</button>
      </div>
    </nav>
  );
};

export default Navigation;