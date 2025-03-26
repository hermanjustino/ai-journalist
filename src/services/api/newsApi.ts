import axios from 'axios';
import { ContentItem } from '../domainTracker';

export class NewsApiService {
  private baseUrl: string = 'http://localhost:3001/api';
  
  /**
   * Search for news articles based on keywords and options
   */
  async searchNews(keywords: string[], options: {
    startDate?: Date,
    endDate?: Date,
    limit?: number
  } = {}): Promise<ContentItem[]> {
    try {
      // Instead of calling News API directly, use our server as a proxy
      const response = await axios.post(`${this.baseUrl}/news/search`, {
        keywords,
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        limit: options.limit || 20
      });
      
      // Map news data to ContentItem format
      return response.data.map((article: any) => ({
        id: article.id || `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        source: 'news',
        content: article.content || article.description || article.title,
        timestamp: new Date(article.timestamp || article.publishedAt || Date.now()),
        author: article.author || 'Unknown',
        title: article.title || 'Untitled Article',
        url: article.url || ''
      }));
    } catch (error) {
      console.error('News API error:', error);
      return [];
    }
  }
}

export default new NewsApiService();