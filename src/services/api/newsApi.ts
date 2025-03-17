import axios from 'axios';
import { ContentItem } from '../domainTracker';

export class NewsApiService {
  private apiKey: string;
  private baseUrl: string = 'https://newsapi.org/v2';
  
  constructor() {
    this.apiKey = process.env.REACT_APP_NEWS_API_KEY || '';
  }
  
  /**
   * Search for news articles based on keywords and options
   */
  async searchNews(keywords: string[], options: {
    startDate?: Date,
    endDate?: Date,
    limit?: number
  } = {}): Promise<ContentItem[]> {
    try {
      // Create search query
      const query = keywords.join(' OR ');
      
      // Set up search parameters
      const params: any = {
        q: query,
        apiKey: this.apiKey,
        language: 'en',
        pageSize: options.limit || 10
      };
      
      // Add date filters if specified
      if (options.startDate) {
        params.from = options.startDate.toISOString().split('T')[0];
      }
      if (options.endDate) {
        params.to = options.endDate.toISOString().split('T')[0];
      }
      
      // Make the API request
      const response = await axios.get(`${this.baseUrl}/everything`, { params });
      
      // Map news data to ContentItem format
      return response.data.articles.map((article: any) => ({
        id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        source: 'news',
        content: article.description || article.title,
        timestamp: new Date(article.publishedAt),
        author: article.author,
        title: article.title,
        url: article.url
      }));
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  }
}

export default new NewsApiService();