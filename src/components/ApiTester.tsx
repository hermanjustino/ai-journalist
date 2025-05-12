import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApiTester.css';

const ApiTester: React.FC = () => {
  const [status, setStatus] = useState<string>('Loading...');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    // Get API base URL from environment or default
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                       (window.location.hostname === 'localhost' ? 
                        'http://localhost:3001' : 
                        window.location.origin);
    setApiUrl(API_BASE_URL);
    
    // Test connectivity
    const testApi = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        setTestResults(response.data);
        setStatus('Connected! ✅');
      } catch (error: any) {
        console.error('API test error:', error);
        setStatus(`Error: ${error.message} ❌`);
        setTestResults({ error: error.message, code: error.code });
      }
    };
    
    testApi();
  }, []);

  return (
    <div className="api-tester">
      <h2>API Connection Tester</h2>
      <div className="api-url">
        <strong>API URL:</strong> {apiUrl}
      </div>
      <div className={`status-message ${status.includes('✅') ? 'success' : 'error'}`}>
        <strong>Status:</strong> {status}
      </div>
      
      {testResults && (
        <div className="test-results">
          <h3>Test Results:</h3>
          <pre>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="debug-tips">
        <h3>Debugging Tips:</h3>
        <ul>
          <li>Check if the server is running on port 3001</li>
          <li>Verify CORS is properly configured in the server</li>
          <li>Make sure your .env.development.local has REACT_APP_API_BASE_URL=http://localhost:3001</li>
          <li>Check browser console for additional error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTester;