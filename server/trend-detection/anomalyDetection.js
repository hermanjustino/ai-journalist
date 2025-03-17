const fs = require('fs');
const path = require('path');

class AnomalyDetector {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/trends');
    
    // Ensure directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
  
  /**
   * Detect anomalies using z-score method
   * @param {Array} values - Array of numeric values
   * @param {Number} threshold - Z-score threshold (default: 2.0)
   * @returns {Array} - Indices of anomalous values
   */
  detectZScoreAnomalies(values, threshold = 2.0) {
    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate standard deviation
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Find anomalies (values beyond threshold standard deviations from mean)
    const anomalies = [];
    
    values.forEach((val, index) => {
      const zScore = stdDev > 0 ? Math.abs(val - mean) / stdDev : 0;
      if (zScore > threshold) {
        anomalies.push(index);
      }
    });
    
    return anomalies;
  }
  
  /**
   * Group content by domain/topic and detect sudden spikes in activity
   * @param {Array} contentItems - Content with timestamps and domain/topic information
   * @param {Object} options - Configuration options
   * @returns {Array} - Detected trend spikes
   */
  detectTrendSpikes(contentItems, options = {}) {
    const timeWindow = options.timeWindow || 24 * 60 * 60 * 1000; // 24 hours in ms
    const groupByKey = options.groupByKey || 'domainId';
    const thresholdMultiplier = options.thresholdMultiplier || 2.0;
    
    // Group content by the specified key (domain, topic, etc.)
    const groupedContent = {};
    
    contentItems.forEach(item => {
      const key = item[groupByKey];
      if (!key) return;
      
      if (!groupedContent[key]) {
        groupedContent[key] = [];
      }
      
      groupedContent[key].push(item);
    });
    
    // Analyze each group for spikes
    const spikes = [];
    
    Object.entries(groupedContent).forEach(([key, items]) => {
      // Sort by timestamp
      items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Count items by time windows
      const timeBuckets = {};
      
      items.forEach(item => {
        const timestamp = new Date(item.timestamp).getTime();
        const bucket = Math.floor(timestamp / timeWindow);
        
        if (!timeBuckets[bucket]) {
          timeBuckets[bucket] = { count: 0, items: [] };
        }
        
        timeBuckets[bucket].count++;
        timeBuckets[bucket].items.push(item);
      });
      
      // Calculate average count per time window
      const bucketCounts = Object.values(timeBuckets).map(b => b.count);
      const avgCount = bucketCounts.reduce((sum, count) => sum + count, 0) / bucketCounts.length;
      
      // Find spikes (buckets with count > average * threshold)
      Object.entries(timeBuckets).forEach(([bucket, data]) => {
        if (data.count > avgCount * thresholdMultiplier) {
          const bucketTimestamp = parseInt(bucket) * timeWindow;
          
          spikes.push({
            key,
            count: data.count,
            avgCount,
            multiplier: data.count / avgCount,
            timestamp: new Date(bucketTimestamp),
            items: data.items.map(item => item.id)
          });
        }
      });
    });
    
    // Sort spikes by multiplier (most significant first)
    return spikes.sort((a, b) => b.multiplier - a.multiplier);
  }
}

module.exports = new AnomalyDetector();