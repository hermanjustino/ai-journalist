import { debugFetch, validateApiConfig } from '../utils/apiDebugger';

// Get API base URL from environment or config
const getApiBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL;
  return validateApiConfig(apiUrl);
};

export const fetchNewsContent = async (options = {}) => {
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}/news`;
  
  console.log('Fetching news with URL:', url);
  
  try {
    const response = await debugFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response format
    if (!data || !Array.isArray(data.items)) {
      console.error('Invalid news API response format:', data);
      throw new Error('Unexpected news API response format');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching news content:', error);
    // Return fallback data structure to prevent crashes
    return { items: [] };
  }
};

export const fetchScholarlyContent = async (options = {}) => {
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}/scholar`;
  
  console.log('Fetching scholarly content with URL:', url);
  
  try {
    const response = await debugFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate response format
    if (!data || !Array.isArray(data.items)) {
      console.error('Invalid scholar API response format:', data);
      throw new Error('Unexpected scholar API response format');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching scholarly content:', error);
    // Return fallback data structure to prevent crashes
    return { items: [] };
  }
};

export default {
  fetchNewsContent,
  fetchScholarlyContent
};
