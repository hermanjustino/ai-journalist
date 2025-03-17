const trendManager = require('./trend-detection/trendManager');

// Create mock content across different domains and time periods
const createMockContent = (count, options = {}) => {
  const domains = ['music', 'fashion', 'film', 'art', 'literature', 'social-media'];
  const items = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Create timestamps ranging from 72 hours ago to now, with clusters
    let hoursAgo;
    if (i % 20 < 5) {
      // Create a "spike" of recent content in a specific domain
      hoursAgo = Math.random() * 6;
      domain = domains[i % domains.length]; // Cluster by domain
    } else {
      hoursAgo = Math.random() * 72;
      domain = domains[Math.floor(Math.random() * domains.length)];
    }
    
    const timestamp = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    
    items.push({
      id: `item-${i}`,
      content: `This is content about ${domain} created ${hoursAgo.toFixed(1)} hours ago`,
      timestamp,
      domainId: domain,
      engagement: Math.floor(Math.random() * 100) + 1
    });
  }
  
  return items;
};

async function testTrendDetection() {
  try {
    console.log('Creating mock data...');
    const mockContent = createMockContent(100);
    
    console.log('Running trend detection...');
    const trends = await trendManager.detectTrends(mockContent, {
      numTopics: 5,
      minClusterSize: 3,
      timeWindow: 8 * 60 * 60 * 1000, // 8 hours
      windowSize: 4
    });
    
    console.log('Trend detection results:');
    console.log(JSON.stringify(trends, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTrendDetection();
