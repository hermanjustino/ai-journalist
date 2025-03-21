import React from 'react';
import { ContentItem } from '../../services/domainTracker';

interface EmergingTopicsProps {
  contentItems: ContentItem[];
}

const EmergingTopics: React.FC<EmergingTopicsProps> = ({ contentItems }) => {
  return (
    <div className="emerging-topics">
      <h2>Emerging Topics</h2>
      <p>{contentItems.length} content items available for analysis</p>
    </div>
  );
};

export default EmergingTopics;