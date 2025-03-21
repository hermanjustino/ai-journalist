import React from 'react';
import { ContentItem } from '../../services/domainTracker';

interface TrendVisualizerProps {
  contentItems: ContentItem[];
}

const TrendVisualizer: React.FC<TrendVisualizerProps> = ({ contentItems }) => {
  return (
    <div className="trend-visualizer">
      <h2>Trend Visualizer</h2>
      <p>{contentItems.length} content items available for visualization</p>
    </div>
  );
};

export default TrendVisualizer;