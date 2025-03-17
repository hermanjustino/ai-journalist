const fs = require('fs');
const path = require('path');

class TimeSeriesAnalyzer {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/trends');
    
    // Ensure directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }
  
  /**
   * Analyze content velocity - how quickly topics are growing
   * @param {Array} contentItems - Content items with timestamps
   * @param {Object} options - Analysis options
   * @returns {Object} - Velocity analysis results
   */

analyzeContentVelocity(contentItems, options = {}) {
    const windowSize = options.windowSize || 8; // hours
    const windowMs = windowSize * 60 * 60 * 1000;
    const groupByKey = options.groupByKey || 'domainId';
    
    // Make sure all content has timestamps as Date objects
    const normalizedContent = contentItems.map(item => ({
      ...item,
      timestamp: item.timestamp instanceof Date 
        ? item.timestamp 
        : new Date(item.timestamp)
    })).filter(item => !isNaN(item.timestamp.getTime()));
    
    // Sort content by timestamp
    normalizedContent.sort((a, b) => a.timestamp - b.timestamp);
    
    // Group content by the specified key
    const groupedContent = this.groupContentByKey(normalizedContent, groupByKey);
    
    // Calculate velocity for each group
    const velocityByGroup = {};
    const topicVelocity = {};
    
    Object.entries(groupedContent).forEach(([key, items]) => {
      if (!items.length) return;
      
      // Get total time range
      const startTime = items[0].timestamp.getTime();
      const endTime = items[items.length - 1].timestamp.getTime();
      const totalTimeRangeHours = (endTime - startTime) / (60 * 60 * 1000);
      
      if (totalTimeRangeHours < 1) return; // Need at least 1 hour of data
      
      // Count items in time windows
      const timeWindows = {};
      
      items.forEach(item => {
        const bucketKey = Math.floor(item.timestamp.getTime() / windowMs);
        if (!timeWindows[bucketKey]) {
          timeWindows[bucketKey] = { count: 0, timestamp: new Date(bucketKey * windowMs) };
        }
        timeWindows[bucketKey].count++;
      });
      
      // Calculate rate of change between windows
      const windowKeys = Object.keys(timeWindows).map(Number).sort();
      
      let velocitySum = 0;
      let velocityCount = 0;
      
      for (let i = 1; i < windowKeys.length; i++) {
        const prevWindow = timeWindows[windowKeys[i-1]];
        const currWindow = timeWindows[windowKeys[i]];
        
        // Calculate velocity as percentage change
        const velocity = prevWindow.count > 0 
          ? ((currWindow.count - prevWindow.count) / prevWindow.count) 
          : 0;
        
        velocitySum += velocity;
        velocityCount++;
        
        // Store velocity data points (for possible visualization)
        if (!velocityByGroup[key]) {
          velocityByGroup[key] = [];
        }
        
        velocityByGroup[key].push({
          startTime: prevWindow.timestamp,
          endTime: currWindow.timestamp,
          startCount: prevWindow.count,
          endCount: currWindow.count,
          velocity
        });
      }
      
      // Calculate average velocity
      const avgVelocity = velocityCount > 0 ? velocitySum / velocityCount : 0;
      topicVelocity[key] = avgVelocity;
    });
    
    return {
      velocityByGroup,
      topicVelocity,
      summary: {
        fastestGrowing: Object.entries(topicVelocity)
          .filter(([_, velocity]) => velocity > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([key, velocity]) => ({ key, velocity })),
        declining: Object.entries(topicVelocity)
          .filter(([_, velocity]) => velocity < 0)
          .sort((a, b) => a[1] - b[1])
          .slice(0, 5)
          .map(([key, velocity]) => ({ key, velocity }))
      }
    };
  }
  
  /**
   * Group content items by a specified key
   * @param {Array} items - Content items to group
   * @param {String} key - Key to group by
   * @returns {Object} - Grouped content items
   */
  groupContentByKey(items, key) {
    return items.reduce((groups, item) => {
      const groupKey = item[key] || 'unknown';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
      return groups;
    }, {});
  }
}

module.exports = new TimeSeriesAnalyzer();