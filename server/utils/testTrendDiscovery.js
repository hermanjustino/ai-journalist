const fs = require('fs');
const path = require('path');
const trendManager = require('../trend-detection/trendManager');

// Create mock content with clustering around specific domains and topics
const createClusteredMockContent = (count = 100) => {
  const domains = ['music', 'fashion', 'film', 'art', 'literature', 'social-media'];
  const items = [];
  const now = new Date();
  
  // Create spike patterns
  const spikes = [
    { domain: 'literature', hoursAgo: [0.5, 1, 1.5, 2], strength: 5 }, // Recent spike in literature
    { domain: 'music', hoursAgo: [10, 11, 12, 12.5], strength: 3 },    // Medium spike in music
  ];
  
  // Create normal distribution of content
  for (let i = 0; i < count * 0.7; i++) {
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const hoursAgo = Math.random() * 72; // Random time in last 72 hours
    const timestamp = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    
    items.push({
      id: `normal-${i}`,
      content: `This is content about ${domain} created ${hoursAgo.toFixed(1)} hours ago`,
      timestamp,
      domainId: domain,
      engagement: Math.floor(Math.random() * 50) + 1
    });
  }
  
  // Create spike distributions
  let spikeCounter = 0;
  spikes.forEach(spike => {
    for (let i = 0; i < spike.strength * 5; i++) {
      // Randomly select from spike hours
      const hoursAgo = spike.hoursAgo[Math.floor(Math.random() * spike.hoursAgo.length)];
      // Add some noise
      const noiseHours = (Math.random() - 0.5) * 0.5;
      const finalHoursAgo = Math.max(0, hoursAgo + noiseHours);
      const timestamp = new Date(now.getTime() - (finalHoursAgo * 60 * 60 * 1000));
      
      items.push({
        id: `spike-${spikeCounter++}`,
        content: `This is trending content about ${spike.domain} created ${finalHoursAgo.toFixed(1)} hours ago`,
        timestamp,
        domainId: spike.domain,
        engagement: Math.floor(Math.random() * 70) + 30 // Higher engagement for spike content
      });
    }
  });
  
  return items;
};

const visualizeTrends = (trends) => {
  console.log('\n===== TREND VISUALIZATION =====');
  
  // Add simple ASCII visualization
  if (trends.trends && trends.trends.length > 0) {
    console.log('\nTrending Topics:');
    trends.trends.forEach(trend => {
      const barLength = Math.ceil(trend.multiplier * 5);
      const bar = '█'.repeat(barLength);
      console.log(`${trend.name} (${trend.multiplier.toFixed(1)}x): ${bar} [${trend.keywords.join(', ')}]`);
    });
  } else {
    console.log('No significant trends detected.');
  }
  
  if (trends.topicDetails) {
    console.log('\nTopic Distribution:');
    Object.entries(trends.topicDetails).forEach(([topicId, details]) => {
      const barLength = Math.ceil(details.count / 2);
      const bar = '▒'.repeat(barLength);
      console.log(`${details.name}: ${bar} (${details.count} items)`);
    });
  }
};

const runTest = async () => {
  try {
    console.log('Creating clustered mock data...');
    const mockContent = createClusteredMockContent(120);
    
    console.log('Running trend detection with controlled spikes...');
    const trends = await trendManager.detectTrends(mockContent, {
      numTopics: 6,
      minClusterSize: 3,
      timeWindow: 4 * 60 * 60 * 1000, // 4 hours
      windowSize: 2 // 2 hour windows
    });
    
    // Save trends to file for inspection
    const outputFile = path.join(__dirname, '../data/trends/test_trends_output.json');
    fs.writeFileSync(outputFile, JSON.stringify(trends, null, 2));
    console.log(`Results saved to ${outputFile}`);
    
    // Visualize trends
    visualizeTrends(trends);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

runTest();