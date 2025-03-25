import React from 'react';
import { ContentItem, DomainMatch, DomainTracker } from '../services/domainTracker';
import culturalDomains from '../config/culturalDomains';
import './Insights.css';

interface InsightsProps {
  contentItems: ContentItem[];
}

const Insights: React.FC<InsightsProps> = ({ contentItems }) => {
  const tracker = new DomainTracker(culturalDomains);
  
  // Calculate insights
  const allMatches: DomainMatch[] = [];
  contentItems.forEach(item => {
    const matches = tracker.analyzeContent(item);
    allMatches.push(...matches);
  });

  // Count domain connections
  const domainConnections: Record<string, Record<string, number>> = {};
  
  // Initialize domain connections
  culturalDomains.forEach(domain => {
    domainConnections[domain.id] = {};
    culturalDomains.forEach(otherDomain => {
      if (domain.id !== otherDomain.id) {
        domainConnections[domain.id][otherDomain.id] = 0;
      }
    });
  });
  
  // Count connections in content
  contentItems.forEach(item => {
    const matches = tracker.analyzeContent(item);
    const domains = matches.map(m => m.domainId);
    
    // Count every pair of domains that appear in the same content
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const domain1 = domains[i];
        const domain2 = domains[j];
        
        if (domainConnections[domain1] && domainConnections[domain1][domain2] !== undefined) {
          domainConnections[domain1][domain2]++;
        }
        
        if (domainConnections[domain2] && domainConnections[domain2][domain1] !== undefined) {
          domainConnections[domain2][domain1]++;
        }
      }
    }
  });

  // Find strongest connections
  const connections: {source: string, target: string, strength: number}[] = [];
  Object.entries(domainConnections).forEach(([domainId, targets]) => {
    Object.entries(targets).forEach(([targetId, count]) => {
      if (count > 0 && domainId < targetId) { // Only add each connection once
        connections.push({
          source: domainId,
          target: targetId,
          strength: count
        });
      }
    });
  });
  
  // Sort by strength
  connections.sort((a, b) => b.strength - a.strength);

  // Get domain by ID helper
  const getDomainName = (id: string): string => {
    const domain = culturalDomains.find(d => d.id === id);
    return domain ? domain.name : id;
  };

  return (
    <div className="insights-container">
      <h2>Cultural Domain Insights</h2>
      
      <section className="key-insights">
        <h3>Key Observations</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <h4>Most Frequent Domain</h4>
            <p className="insight-value">
              {tracker.getTrendingDomains(contentItems)[0]?.domainId 
                ? getDomainName(tracker.getTrendingDomains(contentItems)[0].domainId)
                : "No data"}
            </p>
          </div>
          
          <div className="insight-card">
            <h4>Most Connected Domains</h4>
            <p className="insight-value">
              {connections[0] 
                ? `${getDomainName(connections[0].source)} & ${getDomainName(connections[0].target)}`
                : "No connections"}
            </p>
          </div>
          
          <div className="insight-card">
            <h4>Total Cultural References</h4>
            <p className="insight-value">{allMatches.length}</p>
          </div>
        </div>
      </section>

      <section className="domain-connections">
        <h3>Domain Connections</h3>
        <p className="section-desc">How cultural domains relate to each other in content</p>
        
        <div className="connections-list">
          {connections.map((conn, i) => (
            <div key={i} className="connection-item">
              <div className="connection-domains">
                <span className="domain-badge">{getDomainName(conn.source)}</span>
                <span className="connection-arrow">↔</span>
                <span className="domain-badge">{getDomainName(conn.target)}</span>
              </div>
              <div className="connection-strength">
                <div 
                  className="strength-bar" 
                  style={{ 
                    width: `${Math.min(conn.strength * 20, 100)}%`,
                    backgroundColor: `rgb(141, 35, 39 ${0.5 + (conn.strength / 10)})`
                  }}
                ></div>
                <span className="strength-label">{conn.strength} connections</span>
              </div>
            </div>
          ))}
          
          {connections.length === 0 && (
            <p className="no-data">No domain connections detected in the current content</p>
          )}
        </div>
      </section>

      <section className="domain-keywords">
        <h3>Top Keywords by Domain</h3>
        <div className="keywords-by-domain">
          {culturalDomains.map(domain => {
            // Get all matches for this domain
            const domainMatches = allMatches.filter(match => match.domainId === domain.id);
            
            // Count keyword occurrences
            const keywordCounts: Record<string, number> = {};
            domainMatches.forEach(match => {
              match.matchedKeywords.forEach(keyword => {
                keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
              });
            });
            
            // Sort keywords by frequency
            const sortedKeywords = Object.entries(keywordCounts)
              .sort(([, countA], [, countB]) => countB - countA)
              .slice(0, 5); // Top 5 keywords
            
            return (
              <div key={domain.id} className="domain-keywords-card">
                <h4>{domain.name}</h4>
                {sortedKeywords.length > 0 ? (
                  <ul className="keyword-list">
                    {sortedKeywords.map(([keyword, count]) => (
                      <li key={keyword}>
                        <span className="keyword-text">{keyword}</span>
                        <span className="keyword-count">{count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-keywords">No keywords detected</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Insights;