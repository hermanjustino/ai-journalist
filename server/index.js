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
const newsApiCache = require('./services/NewsApiCache');

const app = express();

// Configure CORS to allow requests from frontend in both local and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://ai-journalist-1.onrender.com',
  'https://ai-journalist-3kvy.onrender.com',
];

// CORS configuration that properly handles different environments
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log(`CORS blocked for origin: ${origin}`);
      const msg = 'The CORS policy for this site does not allow access from the specified origin';
      return callback(new Error(msg), false);
    }
    
    console.log(`CORS allowed for origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'AI Journalist API is running', timestamp: new Date() });
});

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
    const { keywords = [], limit = 10 } = req.body;
    console.log(`Searching news for keywords: ${keywords.join(', ')}`);
    
    // Build the query string from keywords
    const query = keywords.join(' OR ') || 'black culture OR african american OR racial justice';
    
    // Check if we have a valid API key
    if (!process.env.NEWS_API_KEY) {
      console.log('No News API key found');
      return res.status(400).json({ 
        error: 'News API key not configured',
        message: 'The server is not configured with a News API key'
      });
    }
    
    // Check cache first
    const cachedData = newsApiCache.getCachedData(query, limit);
    if (cachedData) {
      console.log('Returning cached news data');
      return res.json(cachedData);
    }
    
    // Check if we're about to exceed rate limits
    const canProceed = apiUsageTracker.trackRequest('news');
    if (canProceed === false) {
      console.log('Rate limit would be exceeded');
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'The News API rate limit has been reached. Please try again later.'
      });
    }
    
    try {
      // Call the News API
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          apiKey: process.env.NEWS_API_KEY,
          language: 'en',
          pageSize: limit
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data && response.data.articles) {
        console.log(`Retrieved ${response.data.articles.length} articles from News API`);
        
        // Format the articles to match our expected format
        const articles = response.data.articles.map((article, i) => ({
          id: `news-${Date.now()}-${i}`,
          title: article.title,
          content: article.content || article.description,
          author: article.author,
          source: 'news',
          url: article.url,
          timestamp: new Date(article.publishedAt).toISOString()
        }));
        
        // Cache the successful response
        newsApiCache.cacheResponse(query, limit, articles);
        
        return res.json(articles);
      } else {
        console.log('Invalid response from News API');
        return res.status(502).json({
          error: 'Invalid API response',
          message: 'The News API returned an invalid response'
        });
      }
    } catch (apiError) {
      console.error('News API error:', apiError.message);
      
      if (apiError.response && apiError.response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit reached',
          message: 'The News API rate limit has been reached'
        });
      } else {
        return res.status(apiError.response?.status || 500).json({
          error: 'API request failed',
          message: apiError.message,
          details: apiError.response?.data || 'No additional details'
        });
      }
    }
  } catch (error) {
    console.error('Error in news search endpoint:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
});

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
    
    const results = await scholarlyService.searchWithBulkSearch(keywords, { 
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
    
    const results = await scholarlyService.searchWithBulkSearch([query], { limit });
    
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

// Add a new test endpoint for Semantic Scholar bulk search API
app.post('/api/scholar/bulk-search-test', async (req, res) => {
  try {
    const { query, fields, sort, limit, token } = req.body;
    
    console.log('Testing Semantic Scholar bulk search with params:', { 
      query, fields, sort, limit, token 
    });
    
    // Set up API URL
    const baseUrl = 'https://api.semanticscholar.org/graph/v1';
    const endpoint = `${baseUrl}/paper/search/bulk`;
    
    // Set up request params
    const params = {
      query: query || 'AAVE',
      fields: fields || 'title,abstract,url,year,authors,venue,publicationDate,externalIds',
      sort: sort || 'publicationDate:desc',
      limit: limit || 100
    };
    
    // Add token for pagination if provided
    if (token) {
      params.token = token;
    }
    
    // Prepare headers
    const headers = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }
    
    // Make the direct API call
    const response = await axios.get(endpoint, {
      params,
      headers,
      timeout: 15000 // Extended timeout for the bulk search
    });
    
    // Return the raw API response
    res.json({
      success: true,
      apiUrl: endpoint,
      requestParams: params,
      responseData: response.data,
      totalResults: response.data.total,
      resultCount: response.data.data ? response.data.data.length : 0,
      nextToken: response.data.next || null
    });
  } catch (error) {
    console.error('Error in Scholar bulk search test:', error);
    
    // Return detailed error information
    res.status(500).json({ 
      success: false,
      error: 'Failed to test Scholar bulk search API',
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : null,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, 'data');
  const trendsDir = path.join(dataDir, 'trends');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
  }
  
  if (!fs.existsSync(trendsDir)) {
    fs.mkdirSync(trendsDir, { recursive: true });
    console.log('Created trends directory');
  }
  
  // Create empty API usage file if it doesn't exist
  const apiUsageFile = path.join(dataDir, 'api-usage.json');
  if (!fs.existsSync(apiUsageFile)) {
    fs.writeFileSync(apiUsageFile, JSON.stringify({
      news: { total: 0, monthly: {} },
      gemini: { total: 0, monthly: {} }
    }));
    console.log('Created api-usage.json file');
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});