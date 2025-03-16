import React, { useState } from 'react';
import { ContentItem } from '../services/domainTracker';
import './Dashboard.css';

interface DashboardProps {
  contentItems: ContentItem[];
  selectedDomain?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ contentItems, selectedDomain }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  
  // Filter content by domain if a domain is selected
  const filteredContent = selectedDomain 
    ? contentItems.filter(item => 
        item.content.toLowerCase().includes(selectedDomain.toLowerCase())
      )
    : contentItems;

  // Group content by source
  const sourceGroups = filteredContent.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get most recent items
  const recentItems = [...filteredContent]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{selectedDomain ? `${selectedDomain} Dashboard` : 'Cultural Insights Dashboard'}</h2>
        <div className="time-filters">
          <button 
            className={timeRange === 'day' ? 'active' : ''} 
            onClick={() => setTimeRange('day')}
          >
            Today
          </button>
          <button 
            className={timeRange === 'week' ? 'active' : ''} 
            onClick={() => setTimeRange('week')}
          >
            This Week
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="dashboard-metrics">
        <div className="metric-card">
          <h3>Total Content</h3>
          <div className="metric-value">{filteredContent.length}</div>
        </div>
        <div className="metric-card">
          <h3>Sources</h3>
          <div className="metric-value">{Object.keys(sourceGroups).length}</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section source-breakdown">
          <h3>Content Sources</h3>
          <div className="source-bars">
            {Object.entries(sourceGroups).map(([source, count]) => (
              <div key={source} className="source-bar-container">
                <div className="source-label">{source}</div>
                <div 
                  className="source-bar" 
                  style={{ 
                    width: `${(count / filteredContent.length) * 100}%`,
                    backgroundColor: source === 'twitter' ? '#1DA1F2' : 
                                     source === 'news' ? '#FF6B6B' : '#4CAF50'
                  }}
                />
                <div className="source-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="section recent-content">
          <h3>Recent Content</h3>
          <ul className="content-list">
            {recentItems.map(item => (
              <li key={item.id} className="content-item">
                <div className="content-header">
                  <span className={`source-badge ${item.source}`}>{item.source}</span>
                  <span className="content-date">{item.timestamp.toLocaleDateString()}</span>
                </div>
                <h4>{item.title}</h4>
                <p>{item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}</p>
                {item.author && <div className="content-author">By: {item.author}</div>}
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="content-link">View Source</a>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;