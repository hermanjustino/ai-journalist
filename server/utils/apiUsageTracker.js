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
        return JSON.parse(data);
      } else {
        // Initialize with default structure if file doesn't exist
        const defaultUsage = {
          twitter: { total: 0, monthly: {} },
          news: { total: 0, monthly: {} },
          tiktok: { total: 0, monthly: {} }
        };
        fs.writeFileSync(this.usageFilePath, JSON.stringify(defaultUsage, null, 2));
        return defaultUsage;
      }
    } catch (error) {
      console.error('Error loading API usage data:', error);
      return {
        twitter: { total: 0, monthly: {} },
        news: { total: 0, monthly: {} },
        tiktok: { total: 0, monthly: {} }
      };
    }
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

  // Get remaining quota for services with known limits
  getRemainingQuota(service) {
    const monthlyUsage = this.getMonthlyUsage(service);
    
    switch(service) {
      case 'tiktok':
        // RapidAPI TikTok free tier has 100 requests/month
        return 100 - monthlyUsage;
      case 'news':
        // News API free tier has 100 requests/day
        // This is just tracking monthly, so not accurate for daily limit
        return 3000 - monthlyUsage; // Roughly 100/day * 30 days
      default:
        return null; // Unknown limit
    }
  }
}



module.exports = new ApiUsageTracker();