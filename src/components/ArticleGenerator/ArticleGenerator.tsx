import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArticleGenerator.css';

// API URL
const API_URL = 'http://localhost:3001/api';

// Define types
interface Trend {
  id: string;
  name: string;
  keywords: string[];
  multiplier: number;
  velocity: number;
  timestamp: Date;
}

interface Article {
  title: string;
  content: string;
  trend: Trend;
  timestamp: Date;
  model?: string;
}

const ArticleGenerator: React.FC = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trends and articles on mount
  useEffect(() => {
    fetchTrends();
    fetchRecentArticles();
  }, []);

  // Fetch available trends
  const fetchTrends = async () => {
    try {
      const response = await axios.get(`${API_URL}/trends/current`);
      if (response.data && response.data.trends) {
        setTrends(response.data.trends.map((trend: any) => ({
          ...trend,
          timestamp: new Date(trend.timestamp)
        })));
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Unable to fetch trends. Please try again later.');
    }
  };

  // Fetch recent articles
  const fetchRecentArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}/articles/recent`);
      const articlesData = response.data.map((article: any) => ({
        ...article,
        timestamp: new Date(article.timestamp),
        trend: {
          ...article.trend,
          timestamp: new Date(article.trend.timestamp)
        }
      }));
      setArticles(articlesData);
      
      // If there are articles, set the first one as current
      if (articlesData.length > 0) {
        setCurrentArticle(articlesData[0]);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  // Format article content with paragraphs
  const formatArticleContent = (content: string) => {
    if (!content) return <p>No content available</p>;
    
    console.log('Article content to format:', content.substring(0, 100) + '...');
    
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) return null;
      
      // Remove markdown bold if present
      const cleanedText = trimmedParagraph.replace(/\*\*/g, '');
      
      return (
        <p key={index} dangerouslySetInnerHTML={{ __html: cleanedText }} />
      );
    }).filter(Boolean);
  };

  // Generate a new article
  const generateArticle = async () => {
    if (!selectedTrendId) {
      setError('Please select a trend first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Generating article for trend:', selectedTrendId);
      const response = await axios.post(`${API_URL}/articles/generate`, {
        trendId: selectedTrendId
      });

      console.log('Article response structure:', 
        Object.keys(response.data), 
        'Has content:', !!response.data.content,
        'Content length:', response.data.content?.length || 0
      );   // Process the article data
      const articleData = {
        ...response.data,
        timestamp: new Date(response.data.timestamp || Date.now()),
        trend: response.data.trend ? {
          ...response.data.trend,
          
          timestamp: response.data.trend.timestamp ? 
      new Date(response.data.trend.timestamp) : 
      new Date()
  } : {
    // Fallback trend data if missing
    id: 'unknown',
    name: 'Unknown Trend',
    keywords: [],
    multiplier: 1.0,
    velocity: 0,
    timestamp: new Date()
  }
};

      setCurrentArticle(articleData);
      setArticles([articleData, ...articles]);
    } catch (err: any) {
      console.error('Article generation error:', err);
      setError(`Failed to generate article: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // View a previously generated article
  const viewArticle = (article: Article) => {
    setCurrentArticle(article);
  };

  return (
    <div className="article-generator">
      <div className="article-header">
        <h2>AI Cultural Journalist</h2>
        <p className="subtitle">Generate articles about trending cultural topics</p>
      </div>

      <div className="article-controls">
        <div className="trend-selector">
          <label>Select a Trending Topic:</label>
          <select
            value={selectedTrendId || ''}
            onChange={(e) => setSelectedTrendId(e.target.value || null)}
            disabled={loading}
          >
            <option value="">-- Select a trend --</option>
            {trends.map(trend => (
              <option key={trend.id} value={trend.id}>
                {trend.name} ({trend.multiplier.toFixed(1)}x)
              </option>
            ))}
          </select>
        </div>

        <button
          className="generate-button"
          onClick={generateArticle}
          disabled={loading || !selectedTrendId}
        >
          {loading ? 'Generating...' : 'Generate Article'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="article-content-area">
        <div className="article-list">
          <h3>Recent Articles</h3>
          {articles.length > 0 ? (
            <ul>
              {articles.map((article, index) => (
                <li
                  key={index}
                  onClick={() => viewArticle(article)}
                  className={currentArticle === article ? 'selected' : ''}
                >
                  <span className="article-title">{article.title}</span>
                  <span className="article-date">
                    {article.timestamp.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-articles">No articles generated yet</div>
          )}
        </div>

        <div className="article-view-container">
        <div className="article-view">
  {currentArticle ? (
    <>
      <h1 className="article-view-title">
        {currentArticle.title}
      </h1>

      {currentArticle.model && (
        <div className="article-model-info">
          Generated by: {currentArticle.model === 'mock' ? 'Template (Mock)' : currentArticle.model}
        </div>
      )}

      <div className="article-view-content">
        {formatArticleContent(currentArticle.content)}
      </div>

                <div className="article-trend-info">
                  <h4>Based on Trend:</h4>
                  <p>{currentArticle.trend?.name || 'Unknown trend'}</p>
                  <div className="trend-keywords">
                    {Array.isArray(currentArticle.trend?.keywords) && 
                     currentArticle.trend.keywords.map((keyword, idx) => (
                      <span key={idx} className="trend-keyword">{keyword}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-article-selected">
                <p>Select a trend and generate an article, or click a recent article to view it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleGenerator;