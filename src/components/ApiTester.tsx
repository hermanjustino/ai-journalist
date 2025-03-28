import React, { useState } from 'react';
import axios from 'axios';
import newsApi from '../services/api/newsApi';
import './ApiTester.css';

const ApiTester: React.FC = () => {
  const [testStatus, setTestStatus] = useState<{
    news?: { success: boolean; message: string };
    server?: { success: boolean; message: string };
    gemini?: { success: boolean; message: string };
  }>({});
  
  const [loading, setLoading] = useState<{
    news: boolean;
    server: boolean;
    gemini: boolean;
  }>({
    news: false,
    server: false,
    gemini: false
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

  // Test Gemini AI
  const testGemini = async () => {
    setLoading(prev => ({ ...prev, gemini: true }));
    try {
      const response = await axios.post('http://localhost:3001/api/debug/test-gemini');
      if (response.data.success) {
        setTestStatus(prev => ({
          ...prev,
          gemini: {
            success: true,
            message: `Success! Generated text: "${response.data.text.substring(0, 50)}..."`
          }
        }));
      } else {
        setTestStatus(prev => ({
          ...prev,
          gemini: {
            success: false,
            message: 'Received response but no text was generated.'
          }
        }));
      }
    } catch (error) {
      setTestStatus(prev => ({
        ...prev,
        gemini: {
          success: false,
          message: `Gemini API error: ${(error as Error).message}`
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, gemini: false }));
    }
  };

  // Run all tests
  const testAll = async () => {
    await testServer();
    await testNews();
    await testGemini();
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
          <h3>Gemini API</h3>
          <button 
            onClick={testGemini} 
            disabled={loading.gemini}
            className="test-button"
          >
            {loading.gemini ? 'Testing...' : 'Test Gemini API'}
          </button>
          {testStatus.gemini && (
            <div className={`test-result ${testStatus.gemini.success ? 'success' : 'error'}`}>
              {testStatus.gemini.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;