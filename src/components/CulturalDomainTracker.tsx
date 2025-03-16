import React, { useState, useEffect } from 'react';
import culturalDomains, { CulturalDomain } from '../config/culturalDomains';
import { DomainTracker, ContentItem } from '../services/domainTracker';
import './CulturalDomainTracker.css'; 

interface Props {
  contentItems?: ContentItem[];
  onDomainSelect?: (domainId: string) => void;
}

const CulturalDomainTracker: React.FC<Props> = ({ contentItems = [], onDomainSelect }) => {
  const [domains, setDomains] = useState<CulturalDomain[]>(culturalDomains);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [trendingDomains, setTrendingDomains] = useState<{domainId: string, count: number, avgConfidence: number}[]>([]);
  
  useEffect(() => {
    if (contentItems.length > 0) {
      const tracker = new DomainTracker(culturalDomains);
      const trending = tracker.getTrendingDomains(contentItems);
      setTrendingDomains(trending);
    }
  }, [contentItems]);

  const handleDomainClick = (domainId: string) => {
    setSelectedDomain(domainId);
    if (onDomainSelect) {
      onDomainSelect(domainId);
    }
  };

  const getDomainById = (id: string): CulturalDomain | undefined => {
    return domains.find(domain => domain.id === id);
  };

  return (
    <div className="cultural-tracker">
      <h2>Black Cultural Domains</h2>
      
      <div className="domains-list">
        {domains.map(domain => (
          <div 
            key={domain.id}
            className={`domain-card ${selectedDomain === domain.id ? 'selected' : ''}`}
            onClick={() => handleDomainClick(domain.id)}
          >
            <h3>{domain.name}</h3>
            <p>{domain.description}</p>
            <div className="categories-preview">
              {domain.categories.map(category => (
                <span key={category.name} className="category-tag">
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {trendingDomains.length > 0 && (
        <div className="trending-domains">
          <h3>Trending Cultural Areas</h3>
          <ul>
            {trendingDomains.slice(0, 5).map(trend => {
              const domain = getDomainById(trend.domainId);
              return domain ? (
                <li key={trend.domainId}>
                  <span className="domain-name">{domain.name}</span>
                  <span className="trend-count">{trend.count} mentions</span>
                  <div className="confidence-bar" 
                       style={{width: `${trend.avgConfidence * 100}%`}} />
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}

      {selectedDomain && (
        <div className="domain-detail">
          <h3>{getDomainById(selectedDomain)?.name} Categories</h3>
          <ul className="categories-list">
            {getDomainById(selectedDomain)?.categories.map(category => (
              <li key={category.name}>
                <h4>{category.name}</h4>
                <p>{category.description}</p>
                <div className="keywords">
                  {category.keywords.map(keyword => (
                    <span key={keyword} className="keyword">{keyword}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CulturalDomainTracker;