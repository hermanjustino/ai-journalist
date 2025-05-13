/**
 * API Debug Utility
 * 
 * Helps diagnose API issues between local and production environments
 */

// Log levels for different environments
const LOG_LEVELS = {
  LOCAL: ['error', 'warn', 'info', 'debug'],
  PRODUCTION: ['error', 'warn']
};

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const currentLogLevels = isProduction ? LOG_LEVELS.PRODUCTION : LOG_LEVELS.LOCAL;

// Enhanced fetch wrapper with detailed logging
export const debugFetch = async (url, options = {}) => {
  const logPrefix = `[API ${isProduction ? 'PROD' : 'LOCAL'}]`;
  
  // Log request details
  if (currentLogLevels.includes('debug')) {
    console.debug(`${logPrefix} Requesting: ${url}`, options);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Log response status
    if (currentLogLevels.includes('debug')) {
      console.debug(`${logPrefix} Response status: ${response.status} ${response.statusText}`);
    }
    
    // Clone the response to inspect its content without consuming it
    const clonedResponse = response.clone();
    
    try {
      // Try to parse as JSON
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await clonedResponse.json();
      } else {
        responseData = await clonedResponse.text();
      }
      
      // Log response data details
      if (currentLogLevels.includes('debug')) {
        if (typeof responseData === 'object') {
          console.debug(`${logPrefix} Response data type: ${Array.isArray(responseData) ? 'array' : 'object'}`);
          console.debug(`${logPrefix} Response data size: ${JSON.stringify(responseData).length} bytes`);
        } else {
          console.debug(`${logPrefix} Response data type: ${typeof responseData}`);
          console.debug(`${logPrefix} Response data: ${responseData.substring(0, 100)}${responseData.length > 100 ? '...' : ''}`);
        }
      }
      
      // Return the original response for normal processing
      return response;
    } catch (parseError) {
      console.error(`${logPrefix} Error parsing response:`, parseError);
      console.error(`${logPrefix} Response content:`, await clonedResponse.text());
      return response;
    }
  } catch (fetchError) {
    console.error(`${logPrefix} Fetch error:`, fetchError);
    throw fetchError;
  }
};

// Check API configuration
export const validateApiConfig = (apiBaseUrl) => {
  console.warn(`${isProduction ? 'PRODUCTION' : 'LOCAL'} API Base URL: ${apiBaseUrl}`);
  
  if (!apiBaseUrl) {
    console.error('Missing API Base URL configuration!');
  } else if (isProduction && apiBaseUrl.includes('localhost')) {
    console.error('Production environment is using localhost API URL!');
  }
  
  return apiBaseUrl;
};

export default {
  debugFetch,
  validateApiConfig
};
