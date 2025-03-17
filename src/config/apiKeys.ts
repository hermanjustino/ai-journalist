export interface ApiConfig {
    twitter: {
      apiKey: string;
      apiKeySecret: string;
      accessToken: string;
      accessTokenSecret: string;
      bearerToken: string;
    };
    news: {
      apiKey: string;
    };
    tiktok: {
      apiKey: string;
      apiSecret: string;
    };
  }
  
  const apiConfig: ApiConfig = {
    twitter: {
      apiKey: process.env.REACT_APP_TWITTER_API_KEY || '',
      apiKeySecret: process.env.REACT_APP_TWITTER_API_KEY_SECRET || '',
      accessToken: process.env.REACT_APP_TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.REACT_APP_TWITTER_ACCESS_TOKEN_SECRET || '',
      bearerToken: process.env.REACT_APP_TWITTER_BEARER_TOKEN || ''
    },
    news: {
      apiKey: process.env.REACT_APP_NEWS_API_KEY || ''
    },
    tiktok: {
      apiKey: process.env.REACT_APP_TIKTOK_API_KEY || '',
      apiSecret: process.env.REACT_APP_TIKTOK_API_SECRET || ''
    }
  };
  
  export default apiConfig;