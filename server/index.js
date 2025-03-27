const express = require('express');
const cors = require('cors');
const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const apiUsageTracker = require('./utils/apiUsageTracker');
const trendsApi = require('./api/trendsApi');
const contentGenerator = require('./content-generation/contentGenerator');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
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
      fromMemory: apiUsageTracker.getAllUsage(),
      remainingTiktok: apiUsageTracker.getRemainingQuota('tiktok')
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error reading usage data',
      details: error.message,
      memoryData: apiUsageTracker.getAllUsage()
    });
  }
});

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  bearerToken: process.env.TWITTER_BEARER_TOKEN
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    apis: {
      twitter: !!process.env.TWITTER_API_KEY,
      news: !!process.env.NEWS_API_KEY,
      rapidapi: !!process.env.RAPIDAPI_KEY
    }
  });
});

app.get('/api/usage-stats', (req, res) => {
  const stats = apiUsageTracker.getAllUsage();

  // Add remaining quotas
  const enhancedStats = {
    ...stats,
    remaining: {
      tiktok: apiUsageTracker.getRemainingQuota('tiktok'),
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

    // Create search query
    const query = keywords.join(' OR ');

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

    res.json(articles);
  } catch (error) {
    console.error('News API error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
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
    console.log('Received scholar search request:', req.body);
    
    // Forward the request to the Python API (trying ports 5001-5005)
    let response;
    let connected = false;
    let error;
    
    // Try ports 5001 through 5005
    for (let port = 5001; port <= 5005; port++) {
      try {
        console.log(`Trying to connect to Python API on port ${port}...`);
        response = await axios.post(`http://localhost:${port}/search`, req.body, {
          timeout: 10000 // 10 second timeout
        });
        console.log(`Successfully connected to Python API on port ${port}`);
        connected = true;
        break;
      } catch (err) {
        error = err;
        console.log(`Failed to connect on port ${port}: ${err.message}`);
      }
    }
    
    if (!connected) {
      throw new Error(`Could not connect to Python API on any port: ${error.message}`);
    }
    
    console.log(`Got ${response.data.length} results from Python scholarly API`);
    res.json(response.data);
  } catch (error) {
    console.error('Error with Python scholarly API:', error.message);
    
    // Fall back to mock data on error
    const mockData = generateMockScholarData();
    console.log('Returning mock data');
    res.json(mockData);
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