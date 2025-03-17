const express = require('express');
const router = express.Router();
const trendManager = require('../trend-detection/trendManager');

// Get current trending topics
router.get('/current', async (req, res) => {
  try {
    const trends = await trendManager.getRecentTrends();
    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Analyze content for trends
router.post('/analyze', async (req, res) => {
  try {
    const { contentItems, options } = req.body;
    
    if (!contentItems || !Array.isArray(contentItems) || contentItems.length === 0) {
      return res.status(400).json({ error: 'Content items are required' });
    }
    
    const trendResults = await trendManager.detectTrends(contentItems, options || {});
    res.json(trendResults);
  } catch (error) {
    console.error('Error analyzing trends:', error);
    res.status(500).json({ error: 'Failed to analyze trends' });
  }
});

// Get trend history
router.get('/history', (req, res) => {
  // This could load trend data from saved files
  res.json({ message: 'Trend history endpoint - to be implemented' });
});

module.exports = router;