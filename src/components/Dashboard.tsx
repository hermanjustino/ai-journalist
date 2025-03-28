import React, { useState } from 'react';
import { ContentItem, DomainTracker } from '../services/domainTracker';
import './Dashboard.css';
import culturalDomains from '../config/culturalDomains';


interface DashboardProps {
  contentItems: ContentItem[];
  selectedDomain?: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ contentItems, selectedDomain }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  
  // Filter content by domain if a domain is selected
  const filteredContent = selectedDomain 
  ? contentItems.filter(item => {
      const tracker = new DomainTracker(culturalDomains);
      const matches = tracker.analyzeContent(item);
      return matches.some(match => match.domainId === selectedDomain);
    })
  : contentItems;

  // Group content by source
  const sourceGroups = filteredContent.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get all items sorted by timestamp (most recent first)
  const sortedItems = [...filteredContent]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
                    backgroundColor: source === 'news' ? '#FF6B6B' : 
                                     source === 'academic' ? '#4CAF50' : '#9C27B0'
                  }}
                />
                <div className="source-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="section recent-content">
          <h3>All Content ({sortedItems.length} items)</h3>
          <div className="content-scrollable-container">
            <ul className="content-list">
              {sortedItems.map(item => (
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
    </div>
  );
};

export default Dashboard;