const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const apiUsageTracker = require('./utils/apiUsageTracker');
const trendsApi = require('./api/trendsApi');
const contentGenerator = require('./content-generation/contentGenerator');
const ScholarlyService = require('./services/ScholarlyService');
const scholarlyService = new ScholarlyService();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

app.use(express.json());

// Mount trends API router
app.use('/api/trends', trendsApi);

app.get('/api/debug-usage', (req, res) => {
  // Load fresh data directly from file
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'data/api-usage.json');
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(rawData);
    res.json({
      fromFile: parsedData,
      fromMemory: apiUsageTracker.getAllUsage()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error reading usage data',
      details: error.message,
      memoryData: apiUsageTracker.getAllUsage()
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    apis: {
      news: !!process.env.NEWS_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

app.get('/api/usage-stats', (req, res) => {
  const stats = apiUsageTracker.getAllUsage();

  const enhancedStats = {
    ...stats,
    remaining: {
      news: apiUsageTracker.getRemainingQuota('news')
    }
  };

  res.json(enhancedStats);
});

// Debug endpoint to check if apiUsageTracker is working
app.get('/api/usage-tracker-test', (req, res) => {
  try {
    // Try to track a request
    apiUsageTracker.trackRequest('test-service');
    
    // Get the usage stats
    const usage = apiUsageTracker.getAllUsage();
    
    res.json({
      message: 'API usage tracker test successful',
      usage,
      hasData: !!usage,
      moduleExists: !!apiUsageTracker,
      functions: {
        trackRequest: typeof apiUsageTracker.trackRequest === 'function',
        getAllUsage: typeof apiUsageTracker.getAllUsage === 'function',
        getRemainingQuota: typeof apiUsageTracker.getRemainingQuota === 'function'
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'API usage tracker test failed',
      error: error.message
    });
  }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API test successful',
    timestamp: new Date().toISOString()
  });
});

// News API endpoint
app.post('/api/news/search', async (req, res) => {
  try {
    const { keywords, startDate, endDate, limit } = req.body;

    // Create a cache key from the request parameters
    const cacheKey = `${keywords?.join('-') || ''}-${startDate || ''}-${endDate || ''}-${limit || 10}`;
    const newsCache = app.locals.newsCache || new Map();
    app.locals.newsCache = newsCache; // Store on app.locals to persist between requests
    const NEWS_CACHE_DURATION = 3600000; // 1 hour

    // Check if we have a cached response
    if (newsCache.has(cacheKey)) {
      const cachedData = newsCache.get(cacheKey);
      if (cachedData.timestamp > Date.now() - NEWS_CACHE_DURATION) {
        console.log('Returning cached news results');
        return res.json(cachedData.data);
      }
    }

    try {
      // Create search query
      const query = keywords?.join(' OR ') || 'education';

      // Set up parameters
      const params = {
        q: query,
        apiKey: process.env.NEWS_API_KEY,
        language: 'en',
        pageSize: limit || 10
      };

      if (startDate) params.from = new Date(startDate).toISOString().split('T')[0];
      if (endDate) params.to = new Date(endDate).toISOString().split('T')[0];

      // Make News API request
      const response = await axios.get('https://newsapi.org/v2/everything', { params });

      // Track this successful API call
      apiUsageTracker.trackRequest('news');

      // Format response
      const articles = response.data.articles.map(article => ({
        id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        source: 'news',
        content: article.description || article.title,
        timestamp: article.publishedAt,
        author: article.author,
        title: article.title,
        url: article.url
      }));

      // Cache the response
      newsCache.set(cacheKey, {
        timestamp: Date.now(),
        data: articles
      });

      res.json(articles);
    } catch (error) {
      console.error('News API error:', error);
      
      // If rate limited or any other error, try to return cached data
      if (error.response?.status === 429 || error.code) {
        console.log('API error, checking for any cached news data');
        // Try to find any cached news data
        const cacheEntries = Array.from(newsCache.entries());
        
        if (cacheEntries.length > 0) {
          // Sort by timestamp to get most recent
          const mostRecent = cacheEntries
            .sort((a, b) => b[1].timestamp - a[1].timestamp)[0];
          
          console.log('Returning fallback cached news results');
          return res.json(mostRecent[1].data);
        }
      }
      
      console.log('No cached data, generating mock news');
      const mockArticles = generateMockNewsData(keywords, limit || 10);
      
      // Cache these mock articles too
      newsCache.set(cacheKey, {
        timestamp: Date.now(),
        data: mockArticles
      });
      
      res.json(mockArticles);
    }
  } catch (error) {
    console.error('Error in news search endpoint:', error);
    res.status(500).json([]);
  }
});

function generateMockNewsData(keywords = [], limit = 10) {
  console.log(`Generating ${limit} mock news items with keywords:`, keywords);
  const articles = [];
  const sources = ['CNN', 'NPR', 'The Atlantic', 'New York Times', 'Washington Post'];
  const authors = ['Jane Smith', 'Robert Johnson', 'Leila Williams', 'David Chen', 'Maria Rodriguez'];
  
  for (let i = 0; i < limit; i++) {
    // Use the provided keywords to make relevant mock content
    const keyword = keywords && keywords.length > 0 ? 
      keywords[i % keywords.length] : 'education';
    
    articles.push({
      id: `mock-news-${Date.now()}-${i}`,
      title: `Recent developments in ${keyword} show promising trends`,
      content: `A recent study on ${keyword} demonstrates significant findings relevant to African American communities. Researchers found evidence of increasing use of AAVE in educational contexts, highlighting the growing recognition of linguistic diversity.`,
      author: authors[i % authors.length],
      source: 'news',
      url: `https://example.com/news/${i}`,
      timestamp: new Date(Date.now() - i * 86400000) // Each article is one day older
    });
  }
  
  return articles;
}

// Get current trends endpoint
app.get('/api/trends/current', (req, res) => {
  try {
    // Load trends from the latest trends file
    const dataDir = path.join(__dirname, 'data/trends');
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('trends_'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return res.json({
        trends: [],
        error: 'No trend data available'
      });
    }

    const latestFile = path.join(dataDir, files[0]);
    const trendData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
    // Send only the trends part
    res.json(trendData.trendingTopics || {
      trends: [],
      error: 'Trend data format error'
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trends',
      trends: []
    });
  }
});

app.post('/api/articles/generate', async (req, res) => {
  try {
    const { trendId } = req.body;
    
    if (!trendId) {
      return res.status(400).json({ error: 'Missing trendId parameter' });
    }
    
    console.log('Generating article for trend:', trendId);
    
    // Load trends to get information about the selected trend
    const dataDir = path.join(__dirname, 'data/trends');
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('trends_'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      return res.status(404).json({ error: 'No trend data available' });
    }
    
    const latestFile = path.join(dataDir, files[0]);
    const trendData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    
    // Find the selected trend
    const trend = trendData.trendingTopics.trends.find(t => t.id === trendId);
    
    if (!trend) {
      return res.status(404).json({ error: 'Trend not found' });
    }
    
    // Get topic details
    const topicDetails = trendData.trendingTopics.topicDetails[trend.topicId];
    
    // Use the content generator to create an AI-generated article
    const article = await contentGenerator.generateArticle(trend, topicDetails);
    
    // Return the generated article
    res.json(article);
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({ error: 'Failed to generate article' });
  }
});

// Get recent articles endpoint
app.get('/api/articles/recent', (req, res) => {
  try {
    const articles = contentGenerator.getRecentArticles(10);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    res.json([]);
  }
});

app.post('/api/debug/test-gemini', async (req, res) => {
  try {
    // Simple prompt for testing
    const prompt = "Write a short paragraph about the importance of jazz in Black culture.";
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'No Gemini API key configured' });
    }
    
    const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });
    
    const response = result.response;
    const text = response.text();
    
    // Track usage
    apiUsageTracker.trackRequest('gemini');
    
    res.json({
      success: true,
      text,
      prompt
    });
  } catch (error) {
    console.error('Error testing Gemini:', error);
    res.status(500).json({ 
      error: 'Gemini API test failed',
      message: error.message 
    });
  }
});

app.post('/api/scholar/search', async (req, res) => {
  try {
    const keywords = req.body.keywords || [];
    const limit = parseInt(req.body.limit) || 15;
    const forceRefresh = req.body.forceRefresh === true;
    
    console.log('Received scholar search request:', { keywords, limit, forceRefresh });
    
    const results = await scholarlyService.searchArticles(keywords, { 
      limit, 
      forceRefresh 
    });
    
    console.log(`Retrieved ${results.length} scholarly results`);
    res.json(results);
  } catch (error) {
    console.error('Error in scholar search endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to search scholarly content',
      message: error.message 
    });
  }
});

app.get('/api/scholar/search', async (req, res) => {
  try {
    const query = req.query.query || 'education';
    const limit = parseInt(req.query.limit) || 15;
    
    console.log(`Received GET scholar search request: query=${query}, limit=${limit}`);
    
    const results = await scholarlyService.searchArticles([query], { limit });
    
    console.log(`Retrieved ${results.length} scholarly results (GET)`);
    res.json(results);
  } catch (error) {
    console.error('Error in GET scholar search endpoint:', error);
    res.status(500).json({
      error: 'Failed to search scholarly content',
      message: error.message
    });
  }
});

// Helper function to generate mock scholarly data with AAVE terms
function generateMockScholarData() {
  return [
    {
      id: `scholar-mock-${Date.now()}-1`,
      title: 'Linguistic Analysis of African American Vernacular English in Educational Content',
      abstract: 'This study examines the prevalence of AAVE in educational materials. We found instances where "he going" and "they be working" as examples in linguistic diversity training.',
      author: ['Williams, J.', 'Thompson, K.'],
      pub_year: '2023',
      venue: 'Journal of Educational Linguistics',
      url: 'https://example.edu/aave-classroom-approaches'
    },
    {
      id: `scholar-mock-${Date.now()}-2`,
      title: 'Code-Switching and Academic Achievement Among African American Students',
      abstract: 'Research indicates students who effectively code-switch between AAVE and Standard English demonstrate higher academic performance. Students often reported "ain\'t got no" choice but to learn both linguistic systems.',
      author: ['Davis, M.', 'Johnson, R.'],
      pub_year: '2022',
      venue: 'Educational Psychology Review',
      url: 'https://example.edu/code-switching-achievement'
    }
  ];
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});