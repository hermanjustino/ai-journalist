const express = require('express');
const cors = require('cors');
const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
require('dotenv').config();
const apiUsageTracker = require('./utils/apiUsageTracker');
const trendsApi = require('./api/trendsApi');

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

// Twitter API endpoint

app.post('/api/twitter/search', async (req, res) => {
  try {
    const { keywords, startDate, endDate, limit } = req.body;

    // Build query
    const query = keywords.join(' OR ');

    try {
      // Set up parameters
      const params = {
        query,
        max_results: limit || 10,
        'tweet.fields': 'created_at,author_id,text',
        'user.fields': 'username,name',
        expansions: 'author_id'
      };

      if (startDate) params.start_time = new Date(startDate).toISOString();
      if (endDate) params.end_time = new Date(endDate).toISOString();

      // Make Twitter API request
      const response = await twitterClient.v2.search(query, params);

      // Track this successful API call
      apiUsageTracker.trackRequest('twitter');

      // Format response
      const tweets = response.data.data.map(tweet => {
        const user = response.data.includes?.users?.find(u => u.id === tweet.author_id);

        return {
          id: tweet.id,
          source: 'twitter',
          content: tweet.text,
          timestamp: tweet.created_at,
          author: user ? `@${user.username}` : undefined,
          title: `Tweet by ${user?.name || 'Unknown'}`,
          url: `https://twitter.com/${user?.username}/status/${tweet.id}`
        };
      });

      res.json(tweets);
    } catch (twitterError) {
      console.error('Twitter API error:', twitterError);

      // Return mock data on Twitter API failure
      const mockTweets = [
        {
          id: `tw-mock-${Date.now()}-1`,
          source: 'twitter',
          content: `Tweet about: ${keywords.join(', ')} #blackculture`,
          timestamp: new Date().toISOString(),
          author: '@culturalcommentator',
          title: 'Perspectives on Black culture'
        },
        {
          id: `tw-mock-${Date.now()}-2`,
          source: 'twitter',
          content: `Discussing the impact of ${keywords[0] || 'hip-hop'} on modern society. #culturalanalysis`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          author: '@academicvoice',
          title: 'Cultural Analysis'
        }
      ];

      // Flag as mock data
      res.json(mockTweets.map(tweet => ({ ...tweet, isMockData: true })));
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
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

// TikTok API endpoint using RapidAPI
app.post('/api/tiktok/search', async (req, res) => {
  try {
    const { keywords, limit = 5 } = req.body;

    // Check if we still have quota for TikTok API
    const remainingTikTokQuota = apiUsageTracker.getRemainingQuota('tiktok');

    if (remainingTikTokQuota <= 0) {
      // Out of quota, immediately return mock data
      console.log('TikTok API monthly quota exceeded, using mock data');
      const fallbackData = generateTikTokMockData(keywords);
      return res.json(fallbackData.map(item => ({ ...item, isMockData: true, quotaExceeded: true })));
    }

    // Use the first keyword for searching
    const searchTerm = keywords[0] || 'black culture';

    // Let's try the correct endpoint structure for tiktok-api23
    const rapidApiOptions = {
      method: 'GET',
      url: 'https://tiktok-api23.p.rapidapi.com/api/search/video',  // Updated endpoint URL
      params: {
        keyword: searchTerm,
        cursor: '0',
        search_id: '0'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com'
      }
    };

    console.log('Trying TikTok API request with options:', rapidApiOptions);

    // Make request to RapidAPI
    const response = await axios.request(rapidApiOptions);
    
    // Track this successful API call with detailed logging
    console.log('TikTok API response received:', response.status);
    apiUsageTracker.trackRequestAndLog('tiktok');

    console.log('TikTok API response structure:',
      Object.keys(response.data),
      response.data.data ? Object.keys(response.data.data) : 'no data property'
    );

    // Check if we have valid data (response structure may vary)
    if (!response.data) {
      throw new Error('Invalid response from TikTok API');
    }

    // Try to extract videos from the response based on possible structures
    let videos = [];
    
    if (response.data.data && Array.isArray(response.data.data)) {
      videos = response.data.data;
    } else if (response.data.videos && Array.isArray(response.data.videos)) {
      videos = response.data.videos;
    } else if (response.data.data && response.data.data.videos) {
      videos = response.data.data.videos;
    } else {
      console.log('Unexpected response structure:', response.data);
    }

    if (videos.length === 0) {
      throw new Error('No videos found in TikTok API response');
    }

    // Format the response into our ContentItem structure - adapt based on actual structure
    const tiktoks = videos.map(video => ({
      id: `tiktok-${video.id || Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      source: 'tiktok',
      content: video.desc || video.description || `TikTok about ${searchTerm}`,
      timestamp: new Date().toISOString(),
      author: `@${video.author?.unique_id || video.author?.uniqueId || video.username || 'unknown'}`,
      title: video.desc || video.description || `TikTok about ${searchTerm}`,
      url: `https://www.tiktok.com/@${video.author?.unique_id || video.author?.uniqueId || video.username || 'unknown'}/video/${video.id || ''}`
    }));

    res.json(tiktoks.map(item => ({
      ...item,
      remaining: apiUsageTracker.getRemainingQuota('tiktok')
    })));

  } // Additional error logging in the catch block
  catch (error) {
    console.error('TikTok API error details:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request made but no response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
  
    // Fall back to mock data
    const keywords = req.body.keywords || [];
    const fallbackData = generateTikTokMockData(keywords);
    res.json(fallbackData.map(item => ({ ...item, isMockData: true })));
  }
});



// Helper function to generate TikTok mock data

function generateTikTokMockData(keywords) {
  // Base cultural content
  const mockTemplates = [
    {
      content: `Black linguistic evolution: AAVE terms and their cultural impact #blackculture #language #aave`,
      author: '@linguisticsscholar',
      title: 'Understanding AAVE and its cultural impact'
    },
    {
      content: `Jazz history lesson: From spirituals to swing - the evolution of Black musical innovation #blackmusic #jazztradition`,
      author: '@musichistorian',
      title: 'Black Musical Traditions'
    },
    {
      content: `Civil rights movement teaching: Freedom Riders - stories we don't learn in school #blackhistory #civilrights`,
      author: '@historyprofessor',
      title: 'Civil Rights Education Series'
    },
    {
      content: `Black tech innovators spotlight: Dr. Gladys West and her contributions to modern computing #blackintech #innovation`,
      author: '@techdiversity',
      title: 'Black Innovation Spotlight'
    }
  ];
  
  // Customize content with keywords if available
  const keyword = keywords && keywords.length > 0 ? keywords[0] : 'black culture';
  const selectedTemplate = mockTemplates[Math.floor(Math.random() * mockTemplates.length)];
  
  return [
    {
      id: `tiktok-mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      source: 'tiktok',
      content: selectedTemplate.content.includes(keyword) 
        ? selectedTemplate.content 
        : `${selectedTemplate.content} featuring ${keyword}`,
      timestamp: new Date().toISOString(),
      author: selectedTemplate.author,
      title: selectedTemplate.title,
      url: 'https://tiktok.com/example'
    }
  ];
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});