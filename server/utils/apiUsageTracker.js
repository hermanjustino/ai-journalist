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
          gemini: { total: 0, monthly: {} },
          semanticScholar: { total: 0, monthly: {} }
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

  // Update the getRemainingQuota method to check actual usage
  getRemainingQuota(service) {
    if (service === 'news') {
      // News API: 100 requests per day
      const monthlyUsage = this.getMonthlyUsage(service);
      return Math.max(0, 100 - monthlyUsage);
    } else if (service === 'gemini') {
      const monthlyUsage = this.getMonthlyUsage(service);
      return Math.max(0, 50 - monthlyUsage);
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

  // Update the trackRequest method to be more robust
  trackRequest(service, count = 1) {
    if (!this.usage[service]) {
      this.usage[service] = { total: 0, monthly: {} };
    }

    // Get current year and month
    const date = new Date();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Get current usage before updating
    const currentMonthlyUsage = this.usage[service].monthly[yearMonth] || 0;
    
    // Check rate limits before updating
    if (service === 'news' && currentMonthlyUsage >= 90) {
      console.warn(`WARNING: News API is approaching its monthly limit (${currentMonthlyUsage}/100).`);
      if (currentMonthlyUsage >= 95) {
        console.error(`ERROR: News API monthly limit reached (${currentMonthlyUsage}/100).`);
        return false;
      }
    } else if (service === 'gemini' && currentMonthlyUsage >= 45) {
      console.warn(`WARNING: Gemini API is approaching its monthly limit (${currentMonthlyUsage}/50).`);
      if (currentMonthlyUsage >= 50) {
        console.error(`ERROR: Monthly Gemini API limit reached (${currentMonthlyUsage}/50). Using mock articles.`);
        return false;
      }
    }
    
    // Update counts
    this.usage[service].total += count;
    this.usage[service].monthly[yearMonth] = currentMonthlyUsage + count;
    
    // Save updated usage
    this.saveUsage();
    
    return true;
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