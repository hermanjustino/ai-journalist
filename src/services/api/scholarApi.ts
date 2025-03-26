import axios from 'axios';
import { ContentItem } from '../domainTracker';

const API_URL = 'http://localhost:3001/api';

export class ScholarApiService {
  /**
   * Search for academic articles based on provided keywords
   */
  async searchArticles(keywords: string[], options: {
    startDate?: Date,
    endDate?: Date,
    limit?: number
  } = {}): Promise<ContentItem[]> {
    try {
      // Call the backend proxy server that handles RapidAPI requests
      const response = await axios.post(`${API_URL}/scholar/search`, {
        keywords,
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        limit: options.limit || 50
      });

      // Map scholar data to ContentItem format
      return response.data.map((article: any) => ({
        id: article.id || `scholar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        source: 'academic',
        content: article.abstract || article.snippet || '',
        timestamp: new Date(article.publishedAt || article.pub_year || Date.now()),
        author: Array.isArray(article.author) ? article.author.join(', ') : article.author,
        title: article.title,
        url: article.pub_url || article.url || '',
        journal: article.venue || article.journal || 'Academic Publication',
        year: article.pub_year || new Date().getFullYear()
      }));
    } catch (error) {
      console.error('Scholar API error:', error);
      return [];
    }
  }
  
}

export default new ScholarApiService();