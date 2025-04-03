const fs = require('fs');
const path = require('path');

class NewsApiCache {
  constructor() {
    this.cacheDir = path.join(__dirname, '../data/cache');
    this.cacheFilePath = path.join(this.cacheDir, 'news-api-cache.json');
    this.cacheExpiry = 3600000; // 1 hour in milliseconds
    this.cache = this.loadCache();
    this.ensureCacheDirectory();
  }

  ensureCacheDirectory() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const data = fs.readFileSync(this.cacheFilePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading news API cache:', error);
    }
    return {};
  }

  saveCache() {
    try {
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error saving news API cache:', error);
    }
  }

  /**
   * Generate a cache key from query parameters
   */
  getCacheKey(query, limit) {
    return `${query}_${limit}`;
  }

  /**
   * Check if we have valid cached data for this query
   */
  getCachedData(query, limit) {
    const key = this.getCacheKey(query, limit);
    const cachedItem = this.cache[key];
    
    if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheExpiry) {
      console.log(`Using cached news data for query: "${query}"`);
      return cachedItem.data;
    }
    
    return null;
  }

  /**
   * Store API response in cache
   */
  cacheResponse(query, limit, data) {
    const key = this.getCacheKey(query, limit);
    
    this.cache[key] = {
      timestamp: Date.now(),
      data: data
    };
    
    this.saveCache();
  }
}

module.exports = new NewsApiCache();
