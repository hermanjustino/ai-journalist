import axios from 'axios';

// Determine API base URL with proper logical evaluation
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  } else if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  } else {
    return window.location.origin;
  }
};

class ContentFetcher {
  // Fetch content from news sources
  async fetchFromNews(options = {}) {
    console.log('Fetching from news with options:', options);
    try {
      const API_BASE_URL = getApiBaseUrl();
      console.log('Using API base URL:', API_BASE_URL);
      
      const response = await axios.post(`${API_BASE_URL}/api/news/search`, {
        keywords: ['black culture', 'african american', 'racial justice'],
        limit: 20,
        ...options
      });
      
      // Handle different response formats
      let articles;
      if (Array.isArray(response.data)) {
        articles = response.data;
      } else if (response.data && response.data.articles) {
        articles = response.data.articles;
      } else if (response.data && response.data.data) {
        articles = response.data.data;
      } else {
        console.error('Unexpected API response format:', response.data);
        return [];
      }
      
      return articles.map((article: any) => ({
        id: article.id || article.url || `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: article.description || article.content || article.title || '',
        title: article.title || 'Untitled Article',
        source: 'news',
        author: article.author || 'Unknown',
        url: article.url || '',
        timestamp: new Date(article.publishedAt || article.timestamp || Date.now())
      }));
    } catch (error) {
      console.error('Error fetching news data:', error);
      throw new Error(`Failed to fetch news content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchFromScholar(options = {}) {
    console.log('Fetching from scholarly sources with options:', options);
    try {
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await axios.post(`${API_BASE_URL}/api/scholar/search`, {
        keywords: ['african american vernacular english', 'aave', 'ebonics'],
        limit: 15,
        ...options
      });
      
      // Handle different response formats
      let articles;
      if (Array.isArray(response.data)) {
        articles = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        articles = response.data.data;
      } else {
        console.error('Unexpected scholar API response format:', response.data);
        return [];
      }
      
      return articles.map((article: any) => {
        return {
          id: article.id || `scholar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          source: 'academic',
          content: article.abstract || article.snippet || '',
          timestamp: new Date(article.publishedAt || article.pub_year || article.publicationDate || Date.now()),
          author: Array.isArray(article.author) ? article.author.join(', ') : article.author || 'Unknown',
          title: article.title || 'Untitled Academic Article',
          url: article.pub_url || article.url || '',
          journal: article.venue || article.journal || 'Academic Publication',
          year: article.pub_year || (new Date()).getFullYear()
        };
      });
    } catch (error) {
      console.error('Error fetching scholarly data:', error);
      throw new Error(`Failed to fetch scholarly content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new ContentFetcher();