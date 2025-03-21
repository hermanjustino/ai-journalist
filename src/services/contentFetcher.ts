import axios from 'axios';
import { ContentItem } from './domainTracker';

// Define API endpoints
const API_BASE_URL = 'http://localhost:3001/api';

// ContentFetcher service
class ContentFetcher {
  // Fetch content from Twitter
  async fetchFromTwitter(options = {}) {
    console.log('Fetching from Twitter with options:', options);
    try {
      const response = await axios.post(`${API_BASE_URL}/twitter/search`, {
        keywords: ['black culture', 'afro', 'hip hop', 'rap', 'black excellence'],
        limit: 20,
        ...options
      });
      
      // Add safety check for response data
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('Twitter API returned unexpected data format:', response.data);
        return [];
      }
      
      return response.data.map((tweet: any) => ({
        id: tweet.id || `tw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: tweet.text || tweet.content || 'No content available',
        // Add null check before substring
        title: (tweet.text || tweet.content || 'No content available').substring(0, 30) + '...',
        source: 'twitter',
        author: tweet.author?.name || 'Unknown',
        url: tweet.id ? `https://twitter.com/i/web/status/${tweet.id}` : null,
        timestamp: new Date(tweet.created_at || tweet.timestamp || Date.now())
      }));
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
      return [];
    }
  }

  // Fetch content from news sources
  async fetchFromNews(options = {}) {
    console.log('Fetching from news with options:', options);
    try {
      const response = await axios.post(`${API_BASE_URL}/news/search`, {
        keywords: ['black culture', 'african american', 'racial justice'],
        limit: 20,
        ...options
      });
      
      return response.data.map((article: any) => ({
        id: article.id || article.url,
        content: article.description || article.title,
        title: article.title,
        source: 'news',
        author: article.author || 'Unknown',
        url: article.url,
        timestamp: new Date(article.publishedAt || Date.now())
      }));
    } catch (error) {
      console.error('Error fetching news data:', error);
      return [];
    }
  }

  // Generate mock content for testing/development
  async getMockContent(count = 20): Promise<ContentItem[]> {
    const sources = ['twitter', 'news', 'tiktok'];
    const domains = [
      { name: 'Music', keywords: ['hip-hop', 'jazz', 'rap', 'r&b', 'musician'] },
      { name: 'Activism', keywords: ['protest', 'civil rights', 'BLM', 'equality', 'justice'] },
      { name: 'Language', keywords: ['slang', 'AAVE', 'expression', 'vernacular'] },
      { name: 'Arts', keywords: ['literature', 'art', 'gallery', 'poetry', 'novel'] },
      { name: 'Innovation', keywords: ['technology', 'startup', 'engineer', 'science'] }
    ];
    
    // Generate mock items
    return Array.from({ length: count }, (_, i) => {
      // Pick a random domain and its keywords
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const keywords = domain.keywords;
      
      // Include 1-3 random keywords from the domain
      const numKeywords = Math.floor(Math.random() * 3) + 1;
      const selectedKeywords: string[] = [];
      for (let j = 0; j < numKeywords; j++) {
        const keyword = keywords[Math.floor(Math.random() * keywords.length)];
        if (!selectedKeywords.includes(keyword)) {
          selectedKeywords.push(keyword);
        }
      }
      
      // Create mock content with the keywords
      const contentWords = [];
      for (let j = 0; j < 20; j++) {
        if (j % 5 === 0 && selectedKeywords.length > 0) {
          contentWords.push(selectedKeywords[Math.floor(Math.random() * selectedKeywords.length)]);
        } else {
          contentWords.push(`word${j}`);
        }
      }

      // Generate mock ContentItem
      return {
        id: `mock-${i}-${Date.now()}`,
        content: contentWords.join(' '),
        title: `${domain.name} related content #${i}`,
        source: sources[Math.floor(Math.random() * sources.length)],
        author: `Mock Author ${i % 5}`,
        url: undefined,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in last week
      };
    });
  }
}

export default new ContentFetcher();