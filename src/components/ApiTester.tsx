import React, { useState } from 'react';
import axios from 'axios';
import twitterApi from '../services/api/twitterApi';
import newsApi from '../services/api/newsApi';
import tiktokApi from '../services/api/tiktokApi';
import './ApiTester.css';

const ApiTester: React.FC = () => {
  const [testStatus, setTestStatus] = useState<{
    twitter?: { success: boolean; message: string };
    news?: { success: boolean; message: string };
    tiktok?: { success: boolean; message: string };
    server?: { success: boolean; message: string };
  }>({});
  
  const [loading, setLoading] = useState<{
    twitter: boolean;
    news: boolean;
    tiktok: boolean;
    server: boolean;
  }>({
    twitter: false,
    news: false,
    tiktok: false,
    server: false
  });

  // Test server connection
  const testServer = async () => {
    setLoading(prev => ({ ...prev, server: true }));
    try {
      const response = await axios.get('http://localhost:3001/api/health');
      setTestStatus(prev => ({
        ...prev,
        server: {
          success: true,
          message: `Server is running: ${response.data.message || 'OK'}`
        }
      }));
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        server: {
          success: false,
          message: 'Server connection failed. Make sure server is running on port 3001.'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, server: false }));
    }
  };

  // Test Twitter API
  const testTwitter = async () => {
    setLoading(prev => ({ ...prev, twitter: true }));
    try {
      const results = await twitterApi.searchTweets(['test'], { limit: 1 });
      if (results.length > 0) {
        setTestStatus(prev => ({
          ...prev,
          twitter: {
            success: true,
            message: `Success! Retrieved ${results.length} tweets.`
          }
        }));
      } else {
        setTestStatus(prev => ({
          ...prev,
          twitter: {
            success: true,
            message: 'API connected but no tweets found. Try different keywords.'
          }
        }));
      }
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        twitter: {
          success: false,
          message: `Twitter API error: ${(error as Error).message}`
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, twitter: false }));
    }
  };

  // Test News API
  const testNews = async () => {
    setLoading(prev => ({ ...prev, news: true }));
    try {
      const results = await newsApi.searchNews(['test'], { limit: 1 });
      if (results.length > 0) {
        setTestStatus(prev => ({
          ...prev,
          news: {
            success: true,
            message: `Success! Retrieved ${results.length} news articles.`
          }
        }));
      } else {
        setTestStatus(prev => ({
          ...prev,
          news: {
            success: true,
            message: 'API connected but no articles found. Try different keywords.'
          }
        }));
      }
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        news: {
          success: false,
          message: `News API error: ${(error as Error).message}`
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  };

  // Test TikTok API
  const testTikTok = async () => {
    setLoading(prev => ({ ...prev, tiktok: true }));
    try {
      const results = await tiktokApi.searchTikToks(['black culture'], { limit: 1 });
      if (results.length > 0) {
        const mockDataFlag = 'isMockData' in results[0];
        
        setTestStatus(prev => ({
          ...prev,
          tiktok: {
            success: true,
            message: mockDataFlag 
              ? 'Retrieved mock data (API may be unavailable or reached limit)'
              : `Success! Retrieved ${results.length} TikTok videos.`
          }
        }));
      } else {
        setTestStatus(prev => ({
          ...prev,
          tiktok: {
            success: false,
            message: 'No TikTok content found.'
          }
        }));
      }
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        tiktok: {
          success: false,
          message: `TikTok API error: ${(error as Error).message}`
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, tiktok: false }));
    }
  };

  // Run all tests
  const testAll = async () => {
    await testServer();
    await testTwitter();
    await testNews();
    await testTikTok();
  };

  return (
    <div className="api-tester">
      <h2>API Connectivity Tester</h2>
      <p className="description">
        Test your API connections to ensure your keys are working correctly.
      </p>

      <div className="test-all">
        <button onClick={testAll}>Test All Connections</button>
      </div>

      <div className="test-grid">
        <div className="test-card">
          <h3>Server Connection</h3>
          <button 
            onClick={testServer} 
            disabled={loading.server}
            className="test-button"
          >
            {loading.server ? 'Testing...' : 'Test Connection'}
          </button>
          {testStatus.server && (
            <div className={`test-result ${testStatus.server.success ? 'success' : 'error'}`}>
              {testStatus.server.message}
            </div>
          )}
        </div>

        <div className="test-card">
          <h3>Twitter API</h3>
          <button 
            onClick={testTwitter} 
            disabled={loading.twitter}
            className="test-button"
          >
            {loading.twitter ? 'Testing...' : 'Test Twitter API'}
          </button>
          {testStatus.twitter && (
            <div className={`test-result ${testStatus.twitter.success ? 'success' : 'error'}`}>
              {testStatus.twitter.message}
            </div>
          )}
        </div>

        <div className="test-card">
          <h3>News API</h3>
          <button 
            onClick={testNews} 
            disabled={loading.news}
            className="test-button"
          >
            {loading.news ? 'Testing...' : 'Test News API'}
          </button>
          {testStatus.news && (
            <div className={`test-result ${testStatus.news.success ? 'success' : 'error'}`}>
              {testStatus.news.message}
            </div>
          )}
        </div>

        <div className="test-card">
          <h3>TikTok API (RapidAPI)</h3>
          <button 
            onClick={testTikTok} 
            disabled={loading.tiktok}
            className="test-button"
          >
            {loading.tiktok ? 'Testing...' : 'Test TikTok API'}
          </button>
          {testStatus.tiktok && (
            <div className={`test-result ${testStatus.tiktok.success ? 'success' : 'error'}`}>
              {testStatus.tiktok.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;