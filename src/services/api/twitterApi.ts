import axios from 'axios';
import { ContentItem } from '../domainTracker';

const API_URL = 'http://localhost:3001/api';

export class TwitterApiService {
  /**
   * Search for tweets based on provided keywords and options
   */
  async searchTweets(keywords: string[], options: {
    startDate?: Date,
    endDate?: Date,
    limit?: number
  } = {}): Promise<ContentItem[]> {
    try {
      const response = await axios.post(`${API_URL}/twitter/search`, {
        keywords,
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        limit: options.limit
      });
      
      return response.data.map((tweet: any) => ({
        ...tweet,
        timestamp: new Date(tweet.timestamp)
      }));
    } catch (error) {
      console.error('Twitter API error:', error);
      
      // Return mock data on failure (for development purposes)
      return [
        {
          id: `tw-mock-${Date.now()}-1`,
          source: 'twitter',
          content: `Tweet about: ${keywords.join(', ')}`,
          timestamp: new Date(),
          author: '@mockuser',
          title: 'Mock Twitter content (API unavailable)'
        }
      ];
    }
  }
}

export default new TwitterApiService();