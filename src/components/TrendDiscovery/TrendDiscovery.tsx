import React, { useEffect, useState } from 'react';
import trendService, { TrendAnalysisResult, TrendingTopic } from '../../services/trendService';
import './TrendDiscovery.css';

interface Props {
  contentItems?: any[];
  autoDetect?: boolean; 
}

const TrendDiscovery: React.FC<Props> = ({ contentItems = [], autoDetect = false }) => {
  const [trendResults, setTrendResults] = useState<TrendAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch trends on component mount or when autoDetect changes
  useEffect(() => {
    if (autoDetect) {
      fetchCurrentTrends();
    }
  }, [autoDetect]);
  
  // When contentItems change significantly, analyze them if we have enough items
  useEffect(() => {
    if (contentItems.length >= 10 && !loading) {
      analyzeTrends();
    }
  }, [contentItems.length]);
  
  const fetchCurrentTrends = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const trends = await trendService.getCurrentTrends();
      setTrendResults(trends);
      
      if (trends.error) {
        setError(trends.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trends');
    } finally {
      setLoading(false);
    }
  };
  
  const analyzeTrends = async () => {
    if (contentItems.length === 0) {
      setError('No content items to analyze');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const trends = await trendService.analyzeTrends(contentItems);
      setTrendResults(trends);
      
      if (trends.error) {
        setError(trends.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze trends');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="trend-discovery">
      <div className="trend-header">
        <h2>Trend Discovery</h2>
        <div className="trend-actions">
          <button onClick={fetchCurrentTrends} disabled={loading}>
            {loading ? 'Loading...' : 'Get Current Trends'}
          </button>
          <button onClick={analyzeTrends} disabled={loading || contentItems.length < 5}>
            Analyze Content
          </button>
        </div>
      </div>
      
      {loading && <div className="loading">Detecting trends...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {trendResults && !loading && (
        <div className="trends-container">
          {trendResults.trends.length > 0 ? (
            <div className="trending-topics">
              <h3>Emerging Topics</h3>
              <div className="trend-list">
                {trendResults.trends.map((trend) => (
                  <div key={trend.id} className="trend-card">
                    <div className="trend-header">
                      <h4>{trend.name}</h4>
                      <span className="trend-score">
                        {trend.multiplier.toFixed(1)}x
                      </span>
                    </div>
                    <div className="trend-keywords">
                      {trend.keywords.map(keyword => (
                        <span key={keyword} className="trend-keyword">{keyword}</span>
                      ))}
                    </div>
                    <div className="trend-metrics">
                      <div className="trend-metric">
                        <span className="metric-label">Count:</span>
                        <span className="metric-value">{trend.count}</span>
                      </div>
                      <div className="trend-metric">
                        <span className="metric-label">Growth:</span>
                        <span className="metric-value">{(trend.velocity * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-trends">No significant trends detected</div>
          )}
          
          {Object.keys(trendResults.topicDetails).length > 0 && (
            <div className="topic-details">
              <h3>Discovered Topics</h3>
              <div className="topics-grid">
                {Object.entries(trendResults.topicDetails).map(([topicId, details]) => (
                  <div key={topicId} className="topic-card">
                    <h4>{details.name}</h4>
                    <div className="topic-keywords">
                      {details.words?.slice(0, 7).map((word, idx) => (
                        <span key={idx} className="topic-keyword" 
                              style={{fontSize: `${Math.max(0.8, Math.min(1.4, 0.8 + word.weight * 2))}rem`}}>
                          {word.word}
                        </span>
                      ))}
                    </div>
                    <div className="topic-count">
                      {details.count} items
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendDiscovery;