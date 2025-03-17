const topicModeling = require('./topicModeling');
const anomalyDetection = require('./anomalyDetection');
const timeSeriesAnalysis = require('./timeSeriesAnalysis');
const fs = require('fs');
const path = require('path');

class TrendManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/trends');
    
    // Ensure directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Cache for recent trends to avoid redundant processing
    this.trendCache = {
      lastProcessed: null,
      results: null
    };
  }

  /**
   * Process content to detect trends, topics, and anomalies
   * @param {Array} contentItems - Content items to analyze
   * @param {Object} options - Configuration options
   * @returns {Object} - Detected trends
   */
  /**
 * Process content to detect trends, topics, and anomalies
 */
async detectTrends(contentItems, options = {}) {
    try {
      console.log(`Starting trend detection for ${contentItems.length} items`);
      
      // Step 1: Extract topics using BERTopic
      const topicResults = await topicModeling.extractTopics(contentItems, {
        numTopics: options.numTopics || 10,
        minClusterSize: options.minClusterSize || 5
      });
      
      // Step 2: Perform anomaly detection
      // First, add engagement metrics if not present (mock data for demo)
      const contentWithEngagement = contentItems.map(item => ({
        ...item,
        engagement: item.engagement || Math.floor(Math.random() * 100) + 1
      }));
      
      // Detect trend spikes
      const spikes = anomalyDetection.detectTrendSpikes(contentWithEngagement, {
        timeWindow: options.timeWindow || 24 * 60 * 60 * 1000, // Default: 24 hours
        groupByKey: options.groupByKey || 'domainId',
        thresholdMultiplier: options.thresholdMultiplier || 2.0
      });
      
      // Step 3: Time-series analysis for velocity detection
      const timeSeriesResults = timeSeriesAnalysis.analyzeContentVelocity(contentItems, {
        windowSize: options.windowSize || 8 // hours
      });
      
      // Step 4: Combine results to identify trending topics
      const trendingTopics = this.combineResults(topicResults, spikes, timeSeriesResults);
      
      // Step 5: Save trend data for later retrieval
      this.saveTrendData({
        timestamp: new Date(),
        topics: topicResults,
        spikes,
        velocityData: timeSeriesResults,
        trendingTopics
      });
      
      // Update cache
      this.trendCache = {
        lastProcessed: new Date(),
        results: trendingTopics
      };
      
      return trendingTopics;
    } catch (error) {
      console.error('Trend detection error:', error);
      return {
        error: error.message,
        topics: [],
        trends: []
      };
    }
  }
  
  /**
   * Get recent trends, using cache if available
   * @param {Object} options - Options including cache TTL
   * @returns {Object} - Recent trend data
   */
  async getRecentTrends(options = {}) {
    const cacheTTL = options.cacheTTL || 60 * 60 * 1000; // Default: 1 hour
    
    // If cache is valid, return cached results
    if (this.trendCache.lastProcessed && 
        this.trendCache.results &&
        (Date.now() - this.trendCache.lastProcessed) < cacheTTL) {
      return this.trendCache.results;
    }
    
    // Otherwise, try to load the most recent saved trend data
    try {
      const files = fs.readdirSync(this.dataDir)
        .filter(file => file.startsWith('trends_'))
        .sort()
        .reverse();
      
      if (files.length > 0) {
        const latestFile = path.join(this.dataDir, files[0]);
        const trendData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
        
        // Update cache
        this.trendCache = {
          lastProcessed: new Date(trendData.timestamp),
          results: trendData.trendingTopics
        };
        
        return trendData.trendingTopics;
      }
    } catch (error) {
      console.error('Error loading recent trends:', error);
    }
    
    // If no cached or saved data, return empty result
    return {
      topics: [],
      trends: [],
      error: 'No recent trend data available'
    };
  }
  
  /**
   * Combine results from different analyses to identify trending topics
   * @param {Object} topicResults - Results from topic modeling
   * @param {Array} spikes - Detected content spikes
   * @param {Object} velocityData - Time-series velocity data
   * @returns {Object} - Combined trending topics
   */
  combineResults(topicResults, spikes, velocityData) {
    // Extract topics that are both semantically coherent and showing anomalous activity
    const trendingTopics = [];
    
    // Map content spike groups to topics
    if (topicResults.topicDetails && spikes.length > 0) {
      // For each spike, find related topics
      spikes.forEach(spike => {
        const relatedTopics = new Set();
        
        // Find topics containing the spike items
        spike.items.forEach(itemId => {
          const topic = topicResults.docIdToTopic && topicResults.docIdToTopic[itemId];
          if (topic !== undefined && topic !== -1) {
            relatedTopics.add(topic.toString());
          }
        });
        
        // Add trending topics with combined data
        relatedTopics.forEach(topicId => {
          const topicDetails = topicResults.topicDetails[topicId];
          if (topicDetails) {
            trendingTopics.push({
              id: `trend-${topicId}-${Date.now()}`,
              topicId,
              name: topicDetails.name,
              keywords: topicDetails.words.slice(0, 5).map(w => w.word),
              multiplier: spike.multiplier,
              count: spike.count,
              velocity: velocityData.topicVelocity[topicId] || 0,
              timestamp: new Date()
            });
          }
        });
      });
    }
    
    // Sort by a combination of spike strength and velocity
    return {
      topics: topicResults.topics || [],
      topicDetails: topicResults.topicDetails || {},
      trends: trendingTopics.sort((a, b) => {
        const aScore = a.multiplier * (1 + a.velocity / 10);
        const bScore = b.multiplier * (1 + b.velocity / 10);
        return bScore - aScore;
      }),
      timestamp: new Date()
    };
  }
  
  /**
   * Save trend data to disk
   * @param {Object} trendData - Trend data to save
   */
  saveTrendData(trendData) {
    const filename = `trends_${Date.now()}.json`;
    const filePath = path.join(this.dataDir, filename);
    
    fs.writeFileSync(filePath, JSON.stringify(trendData, null, 2));
    
    // Optional: Clean up old files (keep last 20)
    this.cleanupOldFiles();
  }
  
  /**
   * Remove old trend data files, keeping only the most recent ones
   * @param {Number} keep - Number of files to keep
   */
  cleanupOldFiles(keep = 20) {
    try {
      const files = fs.readdirSync(this.dataDir)
        .filter(file => file.startsWith('trends_'))
        .sort()
        .reverse();
      
      if (files.length > keep) {
        files.slice(keep).forEach(file => {
          fs.unlinkSync(path.join(this.dataDir, file));
        });
      }
    } catch (error) {
      console.error('Error cleaning up old trend files:', error);
    }
  }
}

module.exports = new TrendManager();