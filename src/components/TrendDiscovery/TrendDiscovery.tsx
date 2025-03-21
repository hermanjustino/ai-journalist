import React from 'react';
import { ContentItem } from '../../services/domainTracker';
import EmergingTopics from './EmergingTopics';
import TrendVisualizer from './TrendVisualizer';
import './TrendDiscovery.css';

interface TrendDiscoveryProps {
  contentItems: ContentItem[];
}

const TrendDiscovery: React.FC<TrendDiscoveryProps> = ({ contentItems }) => {
  return (
    <div className="trend-discovery">
      <h2>Trend Discovery</h2>
      <div className="trend-sections">
        <EmergingTopics contentItems={contentItems} />
        <TrendVisualizer contentItems={contentItems} />
      </div>
    </div>
  );
};

export default TrendDiscovery;