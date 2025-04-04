import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApiUsageDashboard.css';

interface UsageData {
  total: number;
  monthly: Record<string, number>;
}

interface UsageStats {
  news: UsageData;
  gemini?: UsageData;
  remaining: {
    news: number;
  };
}

const ApiUsageDashboard: React.FC = () => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      // Add a timeout and include credentials to help with CORS issues
      const response = await axios.get('http://localhost:3001/api/usage-stats', {
        timeout: 5000,
        withCredentials: true
      });
      console.log("API usage response:", response.data); // Add debug logging
      setUsageStats(response.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load API usage statistics');
      console.error('Error fetching API usage stats:', err);
      console.error('Error details:', err.message, err.code);
      
      // Suggest solutions based on common errors
      if (err.code === 'ERR_NETWORK') {
        console.error('Network error - Make sure your server is running on port 3001');
      } else if (err.code === 'ECONNABORTED') {
        console.error('Request timeout - Check if your server is responding slowly');
      } else if (err.response && err.response.status === 404) {
        console.error('Endpoint not found - Check if /api/usage-stats exists on your server');
      }
    } finally {
      setLoading(false);
    }
  };
  
  fetchUsageStats();
  
  // Refresh data every 2 minutes if component stays open
  const intervalId = setInterval(fetchUsageStats, 120000);
  return () => clearInterval(intervalId);
}, []);
  
  // Get current month for display
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Helper to get current month's usage
  const getCurrentMonthUsage = (service: 'news' | 'gemini'): number => {
    if (!usageStats || !usageStats[service as keyof typeof usageStats]) return 0;
    const date = new Date();
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Use optional chaining for both the service and monthly property
    const serviceData = usageStats[service as keyof typeof usageStats];
    if (serviceData && 'monthly' in serviceData) {
      return serviceData.monthly?.[yearMonth] || 0;
    }
    return 0;
  };
  
  if (loading) {
    return <div className="api-usage-dashboard loading">Loading API usage statistics...</div>;
  }
  
  if (error) {
    return <div className="api-usage-dashboard error">{error}</div>;
  }
  
  if (!usageStats) {
    return <div className="api-usage-dashboard no-data">No API usage data available.</div>;
  }
  
  return (
    <div className="api-usage-dashboard">
      <h2>API Usage Dashboard</h2>
      <div className="usage-period">{currentMonth}</div>
      
      <div className="service-usage-grid">
        <div className="service-card news">
          <h3>News API</h3>
          <div className="usage-stats">
            <div className="usage-stat">
              <span className="stat-label">Monthly Usage</span>
              <span className="stat-value">{getCurrentMonthUsage('news')} requests</span>
            </div>
            <div className="usage-stat">
              <span className="stat-label">Daily Limit</span>
              <span className="stat-value">100 requests</span>
            </div>
          </div>
          {/* Simple progress visualization */}
          <div className="usage-note">
            Note: News API resets daily, this shows monthly cumulative usage.
          </div>
        </div>
        
        {usageStats.gemini && (
          <div className="service-card gemini">
            <h3>Gemini API</h3>
            <div className="usage-stats">
              <div className="usage-stat">
                <span className="stat-label">Monthly Usage</span>
                <span className="stat-value">{getCurrentMonthUsage('gemini')} requests</span>
              </div>
              <div className="usage-stat">
                <span className="stat-label">Total Usage</span>
                <span className="stat-value">{usageStats.gemini.total || 0} requests</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="api-usage-notes">
        <h4>Notes</h4>
        <ul>
          <li>News API: Limited to 100 requests per day on the free tier</li>
          <li>Gemini API: Usage may be subject to Google Cloud quotas</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiUsageDashboard;