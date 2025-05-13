/**
 * Service for scholarly article searches using Semantic Scholar Bulk API
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ScholarlyService {
  constructor() {
    this.baseUrl = 'https://api.semanticscholar.org/graph/v1';
    this.hasValidApiKey = !!process.env.SEMANTIC_SCHOLAR_API_KEY;
    this.cacheDir = path.join(__dirname, '../data/cache');
    this.cacheFile = path.join(this.cacheDir, 'scholar-cache.json');
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.ensureCacheDirectory();
    this.cache = this.loadCache();
  }
  
  ensureCacheDirectory() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
  
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading scholar cache:', error);
    }
    return {};
  }
  
  saveCache() {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error saving scholar cache:', error);
    }
  }
  
  getCacheKey(keywords) {
    return keywords.sort().join('-').toLowerCase();
  }
  
  getCachedResults(keywords) {
    const key = this.getCacheKey(keywords);
    const cachedItem = this.cache[key];
    
    if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheExpiry) {
      console.log(`Using cached scholarly results for: ${keywords.join(', ')}`);
      return cachedItem.data;
    }
    
    return null;
  }
  
  cacheResults(keywords, data) {
    const key = this.getCacheKey(keywords);
    
    this.cache[key] = {
      timestamp: Date.now(),
      data: data
    };
    
    this.saveCache();
  }

  /**
   * Search using the bulk search endpoint for more comprehensive results
   */
  async searchWithBulkSearch(keywords, options) {
    const query = keywords.join(' | '); // Using OR operator in the bulk search query
    const limit = Math.min(options.limit || 15, 1000); // API limits to max 1000
    
    // Check for cached results first unless forced refresh
    if (!options.forceRefresh) {
      const cachedResults = this.getCachedResults(keywords);
      if (cachedResults) {
        return cachedResults;
      }
    }
    
    console.log(`Using bulk search endpoint with query: "${query}"`);
    
    if (!process.env.SEMANTIC_SCHOLAR_API_KEY) {
      throw new Error('Semantic Scholar API key not configured');
    }
    
    const headers = {
      'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
    };
    
    const response = await axios.get(`${this.baseUrl}/paper/search/bulk`, {
      params: {
        query: query,
        limit: limit,
        fields: 'title,abstract,url,year,authors,venue,publicationDate,externalIds',
        sort: 'publicationDate:desc' // Most recent papers first
      },
      headers,
      timeout: 15000 // Extended timeout for bulk search
    });
    
    if (!response.data || !response.data.data) {
      console.error('Invalid bulk search response:', response.data);
      throw new Error('Invalid response from Semantic Scholar bulk search API');
    }
    
    console.log(`Bulk search returned ${response.data.data.length} results out of ${response.data.total} total matches`);
    
    // Format the results to match our expected format
    const results = response.data.data.map(paper => ({
      id: paper.paperId,
      title: paper.title || 'Untitled Paper',
      abstract: paper.abstract || '',
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      pub_year: paper.year,
      publicationDate: paper.publicationDate,
      author: paper.authors ? paper.authors.map(a => a.name).join(', ') : 'Unknown',
      venue: paper.venue || ''
    }));
    
    // Cache the results
    this.cacheResults(keywords, results);
    
    return results;
  }

  /**
   * Call the Semantic Scholar API
   */
  async searchWithSemanticScholar(keywords, options) {
    const query = keywords.join(' OR ');
    const limit = options.limit || 15;
    
    const headers = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }
    
    const response = await axios.get(`${this.baseUrl}/paper/search`, {
      params: {
        query: query,
        limit: limit,
        fields: 'title,abstract,url,year,authors,venue,publicationDate'
      },
      headers,
      timeout: 10000
    });
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from Semantic Scholar API');
    }
    
    // Format the results to match our expected format
    const results = response.data.data.map(paper => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract || '',
      url: paper.url,
      pub_year: paper.year,
      publicationDate: paper.publicationDate,
      author: paper.authors ? paper.authors.map(a => a.name).join(', ') : 'Unknown',
      venue: paper.venue
    }));
    
    // Cache the results
    this.cacheResults(keywords, results);
    
    return results;
  }
}

module.exports = ScholarlyService;