/**
 * Service for scholarly article searches - optimized for shared hosting
 */
class ScholarlyService {
  constructor() {
    this.cacheTime = 1800000; // 30 minutes
    this.cache = new Map();
    console.log('ScholarlyService initialized (Mock Mode)');
  }

  /**
   * Search for scholarly articles - MOCK IMPLEMENTATION FOR SHARED HOSTING
   */
  async searchArticles(keywords, options = {}) {
    const query = Array.isArray(keywords) ? keywords.join(' OR ') : keywords;
    const limit = options.limit || 15;
    const cacheKey = `${query}-${limit}`;
    
    console.log(`Generating mock scholarly results for: "${query}" (limit: ${limit})`);
    
    // Generate mock scholarly results directly
    const results = this.generateSampleResults(keywords, limit);
    
    return results;
  }

  /**
   * Generate sample scholarly results
   */
  generateSampleResults(keywords = [], limit = 15) {
    const articles = [];
    const topics = ['Education', 'Language', 'Arts', 'Technology', 'Anthropology', 'History'];
    const subtopics = ['research', 'study', 'analysis', 'pedagogy', 'theory', 'practice'];
    const aaveTerms = ['vernacular', 'dialect', 'code-switching', 'linguistic', 'expression', 'slang'];
    
    for (let i = 0; i < limit; i++) {
      const topic = topics[i % topics.length];
      const subtopic = subtopics[Math.floor(Math.random() * subtopics.length)];
      const aaveTerm = aaveTerms[Math.floor(Math.random() * aaveTerms.length)];
      const keyword = keywords[i % keywords.length] || 'education';
      
      articles.push({
        id: `scholar-${Date.now()}-${i}`,
        title: `${topic} ${subtopic}: ${keyword} Analysis`,
        abstract: `This research examines ${topic.toLowerCase()} ${subtopic} in the context of ${keyword} with a focus on linguistic diversity. The study highlights the importance of recognizing ${aaveTerm} elements in ${topic.toLowerCase()} settings.`,
        author: [`Johnson, A.`, `Williams, B.`],
        url: `https://example.edu/scholar/${i}`,
        source: 'academic',
        publishedAt: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)).toISOString() // Each is about a month apart
      });
    }
    
    return articles;
  }
}

module.exports = ScholarlyService;