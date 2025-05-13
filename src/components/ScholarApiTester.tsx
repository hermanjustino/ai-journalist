import React, { useState } from 'react';
import axios from 'axios';
import './ScholarApiTester.css';

interface ApiResponse {
  success: boolean;
  apiUrl?: string;
  requestParams?: any;
  responseData?: any;
  totalResults?: number;
  resultCount?: number;
  nextToken?: string | null;
  error?: string;
  message?: string;
}

const ScholarApiTester: React.FC = () => {
  // Form state
  const [query, setQuery] = useState('AAVE african american vernacular english');
  const [fields, setFields] = useState('title,abstract,url,year,authors,venue,publicationDate,externalIds');
  const [sort, setSort] = useState('publicationDate:desc');
  const [limit, setLimit] = useState('100');
  const [token, setToken] = useState('');
  
  // Response state
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Test the API
  const testApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    setCopiedToClipboard(false);
    
    try {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || window.location.origin;
      const apiUrl = `${apiBaseUrl}/api/scholar/bulk-search-test`;
      
      // Make API call
      const result = await axios.post(apiUrl, {
        query,
        fields,
        sort,
        limit: parseInt(limit),
        token: token || undefined
      });
      
      setResponse(result.data);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
      setResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  // Use next token for pagination
  const useNextToken = () => {
    if (response?.nextToken) {
      setToken(response.nextToken);
    }
  };

  // Copy response to clipboard
  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
        .then(() => {
          setCopiedToClipboard(true);
          setTimeout(() => setCopiedToClipboard(false), 2000);
        })
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  return (
    <div className="scholar-api-tester">
      <h2>Semantic Scholar Bulk Search API Tester</h2>
      
      <form onSubmit={testApi} className="api-form">
        <div className="form-group">
          <label htmlFor="query">Query:</label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-control"
          />
          <small>Required. Example: "AAVE african american vernacular english"</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="fields">Fields:</label>
          <input
            id="fields"
            type="text"
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            className="form-control"
          />
          <small>Comma-separated list of fields to return</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="sort">Sort:</label>
          <input
            id="sort"
            type="text"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="form-control"
          />
          <small>Example: "publicationDate:desc", "citationCount:desc"</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="limit">Limit:</label>
          <input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="form-control"
          />
          <small>Max results per page (up to 1000)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="token">Continuation Token:</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="form-control"
          />
          <small>For pagination (leave empty for first page)</small>
        </div>
        
        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Testing...' : 'Test API'}
          </button>
          
          {response?.nextToken && (
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={useNextToken}
            >
              Load Next Page
            </button>
          )}
        </div>
      </form>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div className="api-response">
          <div className="response-header">
            <h3>
              API Response
              {response.totalResults !== undefined && (
                <span className="response-count">
                  (Showing {response.resultCount} of {response.totalResults} total results)
                </span>
              )}
            </h3>
            <button 
              onClick={copyToClipboard}
              className="btn btn-sm btn-outline-secondary"
              title="Copy response to clipboard"
            >
              {copiedToClipboard ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="response-stats">
            <div>Success: {response.success ? 'Yes' : 'No'}</div>
            {response.nextToken && <div>Next Token: {response.nextToken}</div>}
          </div>
          
          <pre className="response-data">
            {JSON.stringify(response.responseData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ScholarApiTester;
