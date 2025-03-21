import { ContentItem } from './domainTracker';
import twitterApi from './api/twitterApi';
import newsApi from './api/newsApi';

/**
 * Sources that can be used for data collection
 */
export enum ContentSource {
  TWITTER = 'twitter',
  NEWS = 'news',
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  PODCAST = 'podcast',
  BLOG = 'blog',
  RESEARCH = 'research'
}

/**
 * Collection filters
 */
export interface CollectionFilters {
  sources: ContentSource[];
  keywords?: string[];
  domains?: string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  creators?: string[];
  includeReplies?: boolean;
  minConfidence?: number;
}

/**
 * Collection job status
 */
export interface CollectionJobStatus {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number; // 0-100
  itemsCollected: number;
  startTime: Date;
  endTime?: Date;
  filters: CollectionFilters;
  error?: string;
}

/**
 * Data collection service for gathering content from various platforms
 */
export class DataCollectionService {
  private activeJobs: Map<string, CollectionJobStatus> = new Map();
  private collectedContent: ContentItem[] = [];

  /**
   * Start a new collection job with the specified filters
   */
  async startCollectionJob(filters: CollectionFilters): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const jobStatus: CollectionJobStatus = {
      id: jobId,
      status: 'pending',
      progress: 0,
      itemsCollected: 0,
      startTime: new Date(),
      filters
    };

    this.activeJobs.set(jobId, jobStatus);

    // Start collection process asynchronously
    this.runCollection(jobId, filters)
      .catch(error => {
        const job = this.activeJobs.get(jobId);
        if (job) {
          job.status = 'failed';
          job.error = error.message;
          job.endTime = new Date();
          this.activeJobs.set(jobId, job);
        }
      });

    return jobId;
  }

  /**
   * Get the status of a collection job
   */
  getJobStatus(jobId: string): CollectionJobStatus | null {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Get all collection jobs
   */
  getAllJobs(): CollectionJobStatus[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get collected content from completed jobs
   */
  getCollectedContent(): ContentItem[] {
    return this.collectedContent;
  }

  /**
   * Internal method to run the actual collection process
   */
  private async runCollection(jobId: string, filters: CollectionFilters): Promise<void> {
    try {
      // Update job status to in progress
      const job = this.activeJobs.get(jobId);
      if (!job) return;

      job.status = 'in_progress';
      this.activeJobs.set(jobId, job);

      // Get keywords from filters
      const keywords = filters.keywords || [];

      // If domains are provided, add their keywords
      if (filters.domains && filters.domains.length > 0) {
        // This would pull keywords from the domains if implemented
        // For now we'll just use the provided keywords
      }

      // Must have at least one keyword
      if (keywords.length === 0) {
        throw new Error('At least one keyword is required for collection');
      }

      // Collection options
      const options = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit || 10
      };

      // Collect content from each source
      let collectedItems: ContentItem[] = [];
      let processedSources = 0;

      for (const source of filters.sources) {
        try {
          let sourceItems: ContentItem[] = [];

          // Collect from the appropriate source
          switch (source) {
            case ContentSource.TWITTER:
              sourceItems = await twitterApi.searchTweets(keywords, options);
              break;

            case ContentSource.NEWS:
              sourceItems = await newsApi.searchNews(keywords, options);
              break;

            case ContentSource.TIKTOK:
              try {
                // Import the TikTok API service
                const tiktokApi = (await import('./api/tiktokApi')).default;
                sourceItems = await tiktokApi.searchTikToks(keywords, options);
              } catch (error) {
                console.error(`Error collecting from ${source}:`, error);

                console.error(`No real API implementation for ${source} yet.`);
                throw new Error(`Cannot collect from ${source}: No API implementation available`);
              }
              break;
            case ContentSource.INSTAGRAM:
            case ContentSource.YOUTUBE:
              // For now, use mock data for other sources
              sourceItems = this.getMockContentForSource(source, keywords.length);
              break;

            default:
              sourceItems = [];
          }

          collectedItems = [...collectedItems, ...sourceItems];

          // Update job stats
          job.itemsCollected += sourceItems.length;
        } catch (error) {
          console.error(`Error collecting from ${source}:`, error);
          // Continue with other sources even if one fails
        }

        // Update progress
        processedSources++;
        job.progress = (processedSources / filters.sources.length) * 100;
        this.activeJobs.set(jobId, job);
      }

      // Add to content collection
      this.collectedContent = [...this.collectedContent, ...collectedItems];

      // Update job status to completed
      job.status = 'completed';
      job.progress = 100;
      job.endTime = new Date();
      this.activeJobs.set(jobId, job);

    } catch (error) {
      console.error('Collection error:', error);
      throw error;
    }
  }

  /**
   * Generate mock content for sources without API implementation yet
   */
  private getMockContentForSource(source: ContentSource, keywordCount: number): ContentItem[] {
    const count = Math.min(3, Math.max(1, keywordCount));

    switch (source) {
      case ContentSource.TIKTOK:
        return [
          {
            id: `tt-${Date.now()}-1`,
            source: 'tiktok',
            content: 'Breaking down AAVE terms that have gone mainstream #blackculture #language #aave',
            timestamp: new Date(),
            author: '@languageexpert',
            title: 'TikTok about AAVE'
          },
          {
            id: `tt-${Date.now()}-2`,
            source: 'tiktok',
            content: 'Teaching historical Black dance moves and their cultural significance #blackdance #culturalhistory',
            timestamp: new Date(),
            author: '@danceeducator',
            title: 'TikTok about Black dance traditions'
          }
        ].slice(0, count);

      case ContentSource.INSTAGRAM:
        return [
          {
            id: `ig-${Date.now()}-1`,
            source: 'instagram',
            content: 'Showcasing my latest painting inspired by the Harlem Renaissance and contemporary Black experiences #blackart #visualarts',
            timestamp: new Date(),
            author: '@visualartist',
            title: 'Instagram post about Black visual art'
          }
        ].slice(0, count);

      case ContentSource.YOUTUBE:
        return [
          {
            id: `yt-${Date.now()}-1`,
            source: 'youtube',
            content: 'How hip-hop transformed from local block parties to a global cultural phenomenon while maintaining its roots in Black expression',
            timestamp: new Date(),
            author: 'Music Historian',
            title: 'The Evolution of Hip-Hop',
            url: 'https://example.com/video1'
          }
        ].slice(0, count);

      default:
        return [];
    }
  }
}

// Export a singleton instance
export default new DataCollectionService();