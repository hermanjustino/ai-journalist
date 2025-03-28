const fs = require('fs');
const path = require('path');

class ApiUsageTracker {
  constructor() {
    this.usageFilePath = path.join(__dirname, '../data/api-usage.json');
    this.ensureDirectoryExists();
    this.usage = this.loadUsage();
  }

  ensureDirectoryExists() {
    const dir = path.dirname(this.usageFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // In the loadUsage method, change the default structure:
loadUsage() {
  try {
    if (fs.existsSync(this.usageFilePath)) {
      const data = fs.readFileSync(this.usageFilePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Filter out Twitter and TikTok if they exist
      const filteredData = {};
      Object.keys(parsed).forEach(key => {
        if (key !== 'twitter' && key !== 'tiktok') {
          filteredData[key] = parsed[key];
        }
      });
      
      return filteredData;
    } else {
      // Initialize with default structure if file doesn't exist
      const defaultUsage = {
        news: { total: 0, monthly: {} },
        gemini: { total: 0, monthly: {} }
      };
      fs.writeFileSync(this.usageFilePath, JSON.stringify(defaultUsage, null, 2));
      return defaultUsage;
    }
  } catch (error) {
    console.error('Error loading API usage data:', error);
    return {
      news: { total: 0, monthly: {} },
      gemini: { total: 0, monthly: {} }
    };
  }
}

getRemainingQuota(service) {
  if (service === 'news') {
    // News API: 100 requests per day
    return 100;
  } else if (service === 'gemini') {
    return 1000;
  }
  return null;
}

  saveUsage() {
    try {
      fs.writeFileSync(this.usageFilePath, JSON.stringify(this.usage, null, 2));
    } catch (error) {
      console.error('Error saving API usage data:', error);
    }
  }

  trackRequest(service, count = 1) {
    if (!this.usage[service]) {
      this.usage[service] = { total: 0, monthly: {} };
    }

    // Get current year and month
    const date = new Date();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Update counts
    this.usage[service].total += count;
    this.usage[service].monthly[yearMonth] = (this.usage[service].monthly[yearMonth] || 0) + count;

    if (service === 'gemini') {
      const monthlyUsage = this.getMonthlyUsage(service);
      // Limit to 50 calls per month
      if (monthlyUsage >= 50) {
        console.warn('Monthly Gemini API limit reached (50 calls). Using mock articles.');
        return false;
      }
    }
    
    // Save updated usage
    this.saveUsage();
    
    // Return current month's usage for this service
    return this.getMonthlyUsage(service);
  }

  trackRequestAndLog(service, count = 1) {
    console.log(`Before tracking ${service}, current usage:`, this.getMonthlyUsage(service));
    const result = this.trackRequest(service, count);
    console.log(`After tracking ${service}, new usage:`, this.getMonthlyUsage(service));
    console.log('Remaining quota:', this.getRemainingQuota(service));
    return result;
  }

  getMonthlyUsage(service) {
    if (!this.usage[service]) return 0;
    
    const date = new Date();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    return this.usage[service].monthly[yearMonth] || 0;
  }

  getTotalUsage(service) {
    return this.usage[service]?.total || 0;
  }

  getAllUsage() {
    return this.usage;
  }

}



module.exports = new ApiUsageTracker();