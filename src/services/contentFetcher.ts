import axios from 'axios';
import { ContentItem } from './domainTracker';

// Define API endpoints
const API_BASE_URL = 'http://localhost:3001/api';

// ContentFetcher service
class ContentFetcher {
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

  async fetchFromScholar(options = {}) {
    console.log('Fetching from Google Scholar with options:', options);
    try {
      const response = await axios.post(`${API_BASE_URL}/scholar/search`, {
        keywords: ['education', 'learning', 'academic', 'teaching', 'african american vernacular english', 'aave'],
        limit: 15,
        ...options
      });
      
      return response.data.map((article: any) => {
        // Create more usable content field with potential AAVE terms when using mock data
        let enhancedContent = article.abstract || article.snippet || '';
        
        // If this is mock data (has specific IDs), improve content for AAVE analysis
        if (article.id && article.id.includes('scholar-mock')) {
          // Add AAVE terms if they're not already present
          if (!enhancedContent.includes('AAVE') && Math.random() > 0.5) {
            enhancedContent += " The study identified patterns like \"he going\" and \"they be working\" in classroom discourse.";
          }
        }
        
        return {
          id: article.id || `scholar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          source: 'academic',
          content: enhancedContent,
          timestamp: new Date(article.publishedAt || article.pub_year || Date.now()),
          author: Array.isArray(article.author) ? article.author.join(', ') : article.author || 'Unknown',
          title: article.title || 'Untitled Academic Article',
          url: article.pub_url || article.url || '',
          journal: article.venue || article.journal || 'Academic Publication',
          year: article.pub_year || new Date().getFullYear()
        };
      });
    } catch (error) {
      console.error('Error fetching scholarly data:', error);
      return [];
    }
  }

async getMockContent(count = 20): Promise<ContentItem[]> {
  const sources = ['news', 'academic']; 
  const aaveTerms = [
    'he going', 'they running', 'she ready',
    'be working', 'be talking', 'be doing',
    "don't know nothing", "ain't got no",
    'done finished', 'been knew', 'he like'
  ];
  
  const domains = [
    { name: 'Education', keywords: ['learning', 'teaching', 'school', 'academic', 'knowledge'] },
    { name: 'Language', keywords: ['slang', 'AAVE', 'expression', 'vernacular'] },
    { name: 'Arts', keywords: ['literature', 'art', 'gallery', 'poetry', 'novel'] }
  ];
  
  // Generate mock items
  const mockItems: ContentItem[] = [];
  
  try {
    for (let i = 0; i < count; i++) {
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
      
      // Create mock content with keywords and AAVE terms
      let content = `This article explores ${selectedKeywords.join(', ')} in educational contexts. `;
      
      // Add AAVE terms to approximately 30% of mock items
      if (Math.random() < 0.3) {
        const aaveTerm = aaveTerms[Math.floor(Math.random() * aaveTerms.length)];
        content += `A participant in the study noted "${aaveTerm}" when discussing their experiences. `;
      }
      
      content += `Research continues to show the importance of inclusive approaches in education.`;

      const source = sources[Math.floor(Math.random() * sources.length)];

      // Generate mock ContentItem
      mockItems.push({
        id: `mock-${source}-${i}-${Date.now()}`,
        content: content,
        title: `${domain.name} Research: ${selectedKeywords[0] || 'Educational'} Analysis`,
        source: source,
        author: `Dr. ${['Johnson', 'Smith', 'Washington', 'Lee', 'Davis'][i % 5]} et al.`,
        url: undefined,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in last week
      });
    }
    
    console.log(`Generated ${mockItems.length} mock content items`);
    return mockItems;
  } catch (error) {
    console.error('Error generating mock content:', error);
    return []; // Return empty array on error
  }
}
}

export default new ContentFetcher();