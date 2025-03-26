import { ContentItem } from './domainTracker';
import newsApi from './api/newsApi';
import scholarApi from './api/scholarApi';

/**
 * Sources that can be used for data collection
 */
export enum ContentSource {
  NEWS = 'news',
  ACADEMIC = 'academic'
}

/**
 * Collection filters
 */
export interface CollectionFilters {
  sources: ContentSource[];
  keywords?: string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  domains?: string[];
}

/**
 * Collection job status
 */
export interface CollectionJobStatus {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  filters: CollectionFilters;
  itemsCollected: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

/**
 * Data collection service for gathering content from news and academic sources
 */
export class DataCollectionService {
  private activeJobs: Map<string, CollectionJobStatus> = new Map();
  private collectedContent: ContentItem[] = [];

  /**
   * Start a new collection job
   */
  async startCollectionJob(filters: CollectionFilters): Promise<string> {
    // Generate job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create job status
    const jobStatus: CollectionJobStatus = {
      id: jobId,
      status: 'pending',
      progress: 0,
      filters,
      itemsCollected: 0,
      startTime: new Date()
    };

    // Store job
    this.activeJobs.set(jobId, jobStatus);

    // Start collection process
    setTimeout(() => this.executeCollection(jobId), 0);

    return jobId;
  }

  /**
   * Get all collection jobs
   */
  getAllJobs(): CollectionJobStatus[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get collected content
   */
  getCollectedContent(): ContentItem[] {
    return this.collectedContent;
  }

  /**
   * Clear collected content
   */
  clearContent(): void {
    this.collectedContent = [];
  }

  /**
   * Internal method to execute the collection
   */
  private async executeCollection(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    try {
      // Update job status
      job.status = 'in_progress';
      this.activeJobs.set(jobId, job);

      // Extract keywords from filters
      const keywords = job.filters.keywords || ['technology', 'innovation', 'digital'];

      // Collection options
      const options = {
        startDate: job.filters.startDate,
        endDate: job.filters.endDate,
        limit: job.filters.limit || 20
      };

      // Process each source
      const newContent: ContentItem[] = [];
      let processedSources = 0;
      const totalSources = job.filters.sources.length;

      for (const source of job.filters.sources) {
        try {
          let items: ContentItem[] = [];
          
          // Collect from the appropriate source
          switch (source) {
            case ContentSource.NEWS:
              items = await newsApi.searchNews(keywords, options);
              break;
              
            case ContentSource.ACADEMIC:
              items = await scholarApi.searchArticles(keywords, options);
              break;
          }
          
          // Add to new content
          newContent.push(...items);
          job.itemsCollected += items.length;
          
          // Update job progress
          processedSources++;
          job.progress = (processedSources / totalSources) * 100;
          this.activeJobs.set(jobId, job);
        } catch (error) {
          console.error(`Error collecting from ${source}:`, error);
        }
      }

      // Update collected content
      this.collectedContent = [...newContent, ...this.collectedContent];

      // Complete job
      job.status = 'completed';
      job.progress = 100;
      job.endTime = new Date();
      this.activeJobs.set(jobId, job);
    } catch (error) {
      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      job.status = 'failed';
      job.error = errorMessage;
      job.endTime = new Date();
      this.activeJobs.set(jobId, job);
      
      console.error('Collection job failed:', errorMessage);
    }
  }
}

export default new DataCollectionService();