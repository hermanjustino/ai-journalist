/**
 * Service for scholarly article searches using Semantic Scholar Bulk API
 */
const axios = require('axios');
const apiUsageTracker = require('../utils/apiUsageTracker');

class ScholarlyService {
  constructor() {
    this.cacheTime = 1800000; // 30 minutes
    this.cache = new Map();
    this.apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    this.baseUrl = 'https://api.semanticscholar.org/graph/v1';
    this.hasValidApiKey = this.apiKey && this.apiKey !== 'YOUR_ACTUAL_API_KEY_HERE';
    
    if (this.hasValidApiKey) {
      console.log('ScholarlyService initialized with Semantic Scholar API');
    } else {
      console.warn('ScholarlyService initialized in fallback mode - no valid API key');
    }
  }

  /**
   * Search for scholarly articles using Semantic Scholar API
   */
  async searchArticles(keywords, options = {}) {
    try {
      // Build query with proper syntax for search
      const query = this.buildSearchQuery(keywords);
      const limit = options.limit || 15;
      const cacheKey = `${query}-${limit}`;
      const forceRefresh = options.forceRefresh === true;
      
      // Check cache first if not forcing refresh
      if (!forceRefresh && this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < this.cacheTime) {
          console.log(`Using cached data for query: "${query}"`);
          return cachedData.results;
        }
      }
      
      console.log(`Searching for scholarly articles with API: "${query}" (limit: ${limit})`);
      
      // Call the Semantic Scholar API
      const results = await this.callSemanticScholarAPI(query, limit);
      
      // Cache the results
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        results
      });
      
      return results;
    } catch (error) {
      console.error('Error searching scholarly articles:', error);
      
      // Fallback to sample results on error
      console.log('Falling back to sample data');
      return this.generateSampleResults(limit);
    }
  }
  
  /**
   * Build a query string using Semantic Scholar's boolean syntax
   * Creates a more targeted query to avoid exceeding result limits
   */
  buildSearchQuery(keywords) {
    if (!keywords || keywords.length === 0) {
      return 'african american vernacular english';
    }
    
    if (typeof keywords === 'string') {
      return keywords;
    }
    
    // Extract specific AAVE terms if present (these should be prioritized)
    const aaveTerms = keywords.filter(k => 
      k.toLowerCase().includes('aave') || 
      k.toLowerCase().includes('african american vernacular') ||
      k.toLowerCase().includes('black english')
    );
    
    // If we have AAVE terms, use those with high priority
    if (aaveTerms.length > 0) {
      const specificQuery = aaveTerms.map(term => {
        return term.includes(' ') ? `"${term}"` : term;
      }).join(' + '); // Use AND operator to make more specific
      
      return specificQuery;
    }
    
    // Otherwise, narrow down the educational terms to be more specific
    // by adding a relevant field context
    const educationalTerms = keywords.filter(k => 
      k.toLowerCase().includes('education') || 
      k.toLowerCase().includes('learning') ||
      k.toLowerCase().includes('academic') ||
      k.toLowerCase().includes('teaching')
    );
    
    // If we have educational terms, make them more specific
    if (educationalTerms.length > 0) {
      // Make the terms more specific by requiring "linguistics" or "language" context
      return `(${educationalTerms.map(t => t.includes(' ') ? `"${t}"` : t).join(' | ')}) + (linguistics | language | "african american")`;
    }
    
    // Default case: make a more focused query
    const mainTerms = keywords.slice(0, 2).map(k => {
      return k.includes(' ') ? `"${k}"` : k;
    }).join(' + ');
    
    return mainTerms || 'african american vernacular english';
  }
  
  /**
   * Call the Semantic Scholar API
   */
  async callSemanticScholarAPI(query, limit) {
    try {
      // Track API usage
      apiUsageTracker.trackRequest('semanticScholar');
      
      // Prepare query parameters - first try with regular search
      const params = {
        query,
        limit: Math.min(limit, 100), // API supports up to 100 papers per standard search call
        fields: 'title,abstract,authors,year,venue,url,openAccessPdf,publicationDate',
      };
      
      // Call the search endpoint
      const response = await axios.get(`${this.baseUrl}/paper/search/bulk`, {
        params,
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      // Check for valid response structure
      if (!response.data || !response.data.data) {
        console.error('Invalid API response structure:', response.data);
        throw new Error('Invalid response from Semantic Scholar API');
      }
      
      // Log success
      console.log(`Retrieved ${response.data.data.length} papers from Semantic Scholar API`);
      console.log(`Total matches: ${response.data.total || 'unknown'}`);
      
      // Map the response to our expected format (limit to requested amount)
      return response.data.data
        .slice(0, limit)
        .map(paper => ({
          id: `scholar-${paper.paperId || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: paper.title || 'Untitled Article',
          abstract: paper.abstract || 'No abstract available',
          author: paper.authors ? paper.authors.map(a => a.name) : ['Unknown'],
          pub_year: paper.year ? paper.year.toString() : (
            paper.publicationDate 
              ? new Date(paper.publicationDate).getFullYear().toString()
              : new Date().getFullYear().toString()
          ),
          venue: paper.venue || 'Academic Journal',
          url: paper.url || (paper.openAccessPdf ? paper.openAccessPdf.url : ''),
          source: 'academic',
          publishedAt: paper.publicationDate || new Date((paper.year || new Date().getFullYear()), 0).toISOString()
        }));
    } catch (error) {
      console.error('Error calling Semantic Scholar API:', error.message);
      if (error.response) {
        console.error('API response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      // If we get a "too many results" error, try a more specific query
      if (error.response?.status === 400 && 
          error.response?.data?.error?.includes("too many hits")) {
        console.log("Too many results, trying to narrow down query...");
        
        // Try with a more specific query for AAVE content
        try {
          const narrowQuery = `"african american vernacular english" + linguistics`;
          console.log(`Retrying with narrower query: ${narrowQuery}`);
          
          // Call with the narrow query
          const retryResponse = await axios.get(`${this.baseUrl}/paper/search/bulk`, {
            params: {
              query: narrowQuery,
              limit: Math.min(limit, 100),
              fields: 'title,abstract,authors,year,venue,url,openAccessPdf,publicationDate',
            },
            headers: {
              'x-api-key': this.apiKey
            }
          });
          
          if (retryResponse.data && retryResponse.data.data) {
            console.log(`Retry successful! Retrieved ${retryResponse.data.data.length} papers`);
            
            return retryResponse.data.data
              .slice(0, limit)
              .map(paper => ({
                id: `scholar-${paper.paperId || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                title: paper.title || 'Untitled Article',
                abstract: paper.abstract || 'No abstract available',
                author: paper.authors ? paper.authors.map(a => a.name) : ['Unknown'],
                pub_year: paper.year ? paper.year.toString() : new Date().getFullYear().toString(),
                venue: paper.venue || 'Academic Journal',
                url: paper.url || (paper.openAccessPdf ? paper.openAccessPdf.url : ''),
                source: 'academic',
                publishedAt: paper.publicationDate || new Date((paper.year || new Date().getFullYear()), 0).toISOString()
              }));
          }
        } catch (retryError) {
          console.error('Retry attempt also failed:', retryError.message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Generate sample scholarly results for fallback
   */
  generateSampleResults(limit = 15) {
    console.log(`Generating ${limit} sample scholarly results`);
    const currentYear = new Date().getFullYear();
    const sampleResults = [];
    
    // Create a realistic distribution of papers by year
    // Extend range to include earlier years
    for (let i = 0; i < limit; i++) {
      // Calculate a weighted year (go back up to 70 years to include older publications)
      const yearOffset = Math.floor(Math.pow(Math.random(), 1.5) * 70); // 0-70 years ago
      const year = currentYear - yearOffset;
      
      sampleResults.push({
        id: `scholar-mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        paperId: `mock-paper-${i}`,
        title: `Sample Paper on AAVE in ${['Education', 'Linguistics', 'Media', 'Social Context'][i % 4]}`,
        year: year,
        publicationDate: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        abstract: `This paper examines the role of African American Vernacular English in various contexts. The research highlights important linguistic features and their social implications.`,
        author: [`Author ${i+1}`, `Co-Author ${i+1}`],
        venue: ['Journal of Sociolinguistics', 'Language & Education', 'American Speech', 'Journal of Black Studies'][i % 4],
        url: `https://example.org/sample-paper-${i}`,
        source: 'academic'
      });
    }
    
    return sampleResults;
  }
}

module.exports = ScholarlyService;