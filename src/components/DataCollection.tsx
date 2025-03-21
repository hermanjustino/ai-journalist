import React, { useState, useEffect } from 'react';
import dataCollectionService, {
  ContentSource,
  CollectionFilters,
  CollectionJobStatus
} from '../services/dataCollection';
import culturalDomains from '../config/culturalDomains';
import './DataCollection.css';
import { ContentItem } from '../services/domainTracker';

interface DataCollectionProps {
  onContentCollected: (items: ContentItem[]) => void;
}

const DataCollection: React.FC<DataCollectionProps> = ({ onContentCollected }) => {
  const [sources, setSources] = useState<ContentSource[]>([
    ContentSource.TWITTER, ContentSource.NEWS
  ]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [limit, setLimit] = useState<number>(50);
  const [activeJobs, setActiveJobs] = useState<CollectionJobStatus[]>([]);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);

  // Load active jobs on component mount
  useEffect(() => {
    setActiveJobs(dataCollectionService.getAllJobs());
  }, []);

  // Update job statuses periodically
  useEffect(() => {
    if (activeJobs.length === 0) return;

    const interval = setInterval(() => {
      setActiveJobs(dataCollectionService.getAllJobs());

      // Check if any job is still in progress
      const anyJobActive = dataCollectionService.getAllJobs().some(
        job => job.status === 'in_progress' || job.status === 'pending'
      );

      setIsCollecting(anyJobActive);

      if (!anyJobActive) {
        // All jobs complete, notify parent of collected content
        const collectedContent = dataCollectionService.getCollectedContent();
        onContentCollected(collectedContent);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJobs, onContentCollected]);

  const handleSourceToggle = (source: ContentSource) => {
    if (sources.includes(source)) {
      setSources(sources.filter(s => s !== source));
    } else {
      setSources([...sources, source]);
    }
  };

  const handleDomainToggle = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(id => id !== domainId));
    } else {
      setSelectedDomains([...selectedDomains, domainId]);
    }
  };

  const startCollection = async () => {
    // Create filters from current state
    const filters: CollectionFilters = {
      sources,
      domains: selectedDomains.length > 0 ? selectedDomains : undefined,
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
      startDate: dateRange.start,
      endDate: dateRange.end,
      limit
    };

    // Start a new collection job
    await dataCollectionService.startCollectionJob(filters);

    // Update job list
    setActiveJobs(dataCollectionService.getAllJobs());
    setIsCollecting(true);
  };

  return (
    <div className="data-collection">
      <h2>Data Collection</h2>

      {/* Add real content indicator */}
      <div className="content-mode-indicator">
        <span className="indicator real">Using Real Content APIs</span>
      </div>

      <div className="collection-form">
        <div className="form-section">
          <h3>Content Sources</h3>
          <div className="sources-grid">
            {Object.values(ContentSource).map(source => (
              <div key={source} className="source-toggle">
                <label className={sources.includes(source) ? 'selected' : ''}>
                  <input
                    type="checkbox"
                    checked={sources.includes(source)}
                    onChange={() => handleSourceToggle(source)}
                  />
                  <span className="source-label">{source}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Cultural Domains</h3>
          <div className="domains-grid">
            {culturalDomains.map(domain => (
              <div key={domain.id} className="domain-toggle">
                <label className={selectedDomains.includes(domain.id) ? 'selected' : ''}>
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain.id)}
                    onChange={() => handleDomainToggle(domain.id)}
                  />
                  <span className="domain-label">{domain.name}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Keywords</h3>
          <p className="form-hint">Enter comma-separated keywords</p>
          <textarea
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="hip-hop, civil rights, AAVE, etc."
            rows={3}
          />
        </div>

        <div className="form-section">
          <h3>Date Range</h3>
          <div className="date-inputs">
            <div className="date-input">
              <label>Start Date</label>
              <input
                type="date"
                onChange={e => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>
            <div className="date-input">
              <label>End Date</label>
              <input
                type="date"
                onChange={e => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : undefined })}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Content Limit</h3>
          <input
            type="number"
            min="1"
            max="1000"
            value={limit}
            onChange={e => setLimit(parseInt(e.target.value) || 50)}
          />
        </div>

        <div className="collection-actions">
          <button
            className="start-collection-btn"
            onClick={startCollection}
            disabled={isCollecting || sources.length === 0}
          >
            {isCollecting ? 'Collection in Progress...' : 'Start Collection'}
          </button>
        </div>
      </div>

      {activeJobs.length > 0 && (
        <div className="active-jobs">
          <h3>Collection Jobs</h3>
          <div className="jobs-list">
            {activeJobs.map(job => (
              <div key={job.id} className={`job-card job-${job.status}`}>
                <div className="job-header">
                  <h4>Job {job.id.substring(0, 8)}...</h4>
                  <span className={`job-status status-${job.status}`}>{job.status}</span>
                </div>

                <div className="job-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${job.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{job.progress.toFixed(0)}%</span>
                </div>

                <div className="job-details">
                  <div className="detail-item">
                    <span className="detail-label">Sources:</span>
                    <span className="detail-value">{job.filters.sources.join(', ')}</span>
                  </div>
                  {job.filters.domains && (
                    <div className="detail-item">
                      <span className="detail-label">Domains:</span>
                      <span className="detail-value">{job.filters.domains.join(', ')}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{job.itemsCollected}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Started:</span>
                    <span className="detail-value">{job.startTime.toLocaleTimeString()}</span>
                  </div>
                  {job.endTime && (
                    <div className="detail-item">
                      <span className="detail-label">Completed:</span>
                      <span className="detail-value">{job.endTime.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {job.error && (
                  <div className="job-error">
                    Error: {job.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCollection;