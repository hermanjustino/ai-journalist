import axios from 'axios';
import { ContentItem } from './domainTracker';

const API_URL = 'http://localhost:3001/api';

export interface TrendKeyword {
  word: string;
  weight: number;
}

export interface TopicDetail {
  name: string;
  docs: string[];
  words: TrendKeyword[];
  count: number;
}

export interface TrendingTopic {
  id: string;
  topicId: string;
  name: string;
  keywords: string[];
  multiplier: number;
  count: number;
  velocity: number;
  timestamp: Date;
}

export interface TrendAnalysisResult {
  topics: number[];
  topicDetails: Record<string, TopicDetail>;
  trends: TrendingTopic[];
  timestamp: Date;
  error?: string;
}

export class TrendService {
  /**
   * Get current trending topics
   */
  async getCurrentTrends(): Promise<TrendAnalysisResult> {
    try {
      const response = await axios.get(`${API_URL}/trends/current`);
      return this.normalizeTrendData(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
      return {
        topics: [],
        topicDetails: {},
        trends: [],
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Failed to fetch trends'
      };
    }
  }
  
  /**
   * Submit content for trend analysis
   */

  async analyzeTrends(
    contentItems: ContentItem[], 
    options: { numTopics?: number, minClusterSize?: number } = {}
  ): Promise<TrendAnalysisResult> {
    try {
      const response = await axios.post(`${API_URL}/trends/analyze`, {
        contentItems,
        options
      });
      
      return this.normalizeTrendData(response.data);
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return {
        topics: [],
        topicDetails: {},
        trends: [],
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Normalize trend data by ensuring proper types
   */
  private normalizeTrendData(data: any): TrendAnalysisResult {
    // Ensure trends array exists and dates are properly parsed
    const trends = (data.trends || []).map((trend: TrendingTopic) => ({
      ...trend,
      timestamp: new Date(trend.timestamp)
    }));
    
    return {
      topics: data.topics || [],
      topicDetails: data.topicDetails || {},
      trends: trends,
      timestamp: new Date(data.timestamp || Date.now()),
      error: data.error
    };
  }
}

export default new TrendService();