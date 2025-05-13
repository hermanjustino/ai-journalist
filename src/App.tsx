import { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import About from './components/About';
import TrendDiscovery from './components/TrendDiscovery/TrendDiscovery';
import Dashboard from './components/Dashboard';
import { ContentItem } from './services/domainTracker';
import contentFetcher from './services/contentFetcher';
import './App.css';
import AAVEPublicationsTimeline from './components/PublicationsTimeline/AAVEPublicationsTimeline';
import ScholarApiTester from './components/ScholarApiTester';


function App() {
  // Change default view to AAVE dashboard
  const [currentView, setCurrentView] = useState<string>('publications-timeline');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');

  useEffect(() => {
    // Set API base URL for display in UI
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 
                   (window.location.hostname === 'localhost' ? 
                    'http://localhost:3001' : 
                    window.location.origin);
    setApiBaseUrl(baseUrl);
    console.log("Using API base URL:", baseUrl);
  }, []);

  const fetchContentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Only fetch content from news and scholar sources
      let newsContent: any[] = [];
      let scholarContent: any[] = [];
      
      try {
        newsContent = await contentFetcher.fetchFromNews();
        console.log('Retrieved news content:', newsContent.length, 'items');
      } catch (newsErr) {
        console.error('Error fetching news content:', newsErr);
        setError(`Failed to fetch news content. ${newsErr instanceof Error ? newsErr.message : ''}`);
      }
      
      try {
        scholarContent = await contentFetcher.fetchFromScholar();
        console.log('Retrieved scholar content:', scholarContent.length, 'items');
      } catch (scholarErr) {
        console.error('Error fetching scholarly content:', scholarErr);
        if (!error) {
          setError(`Failed to fetch scholarly content. ${scholarErr instanceof Error ? scholarErr.message : ''}`);
        }
      }

      // Combine news and scholar content
      const formattedNewsContent = newsContent.map(formatContent);
      const formattedScholarContent = scholarContent.map(formatContent);
      const allContent: ContentItem[] = [
        ...formattedNewsContent,
        ...formattedScholarContent
      ];

      console.log(`Got ${formattedNewsContent.length} news and ${formattedScholarContent.length} scholar items`);

      if (allContent.length === 0) {
        console.log('No content available from APIs');
        if (!error) {
          setError('No content available. Please check your API keys and connections.');
        }
        setContentItems([]);
      } else {
        setContentItems(allContent);
        console.log(`Total items loaded: ${allContent.length}`);
      }
    } catch (err) {
      console.error('Error in content fetching logic:', err);
      setError(`Failed to load content. ${err instanceof Error ? err.message : 'Unknown error'}`);
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentData();
  }, [fetchContentData]);

  // Format content to ensure consistency
  const formatContent = (item: any): ContentItem => {
    return {
      id: item.id || `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: item.content || item.text || item.description || '',
      title: item.title || '',
      source: item.source || 'unknown',
      author: item.author || 'Unknown',
      url: item.url || null,
      timestamp: new Date(item.timestamp || item.created_at || Date.now())
    };
  };

  // Render the current view with consistent data
  const renderCurrentView = () => {
    if (loading) {
      return <div className="loading-container">Loading content data...</div>;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard contentItems={contentItems} />;
      case 'about':
        return <About />;
      case 'trends':
        return <TrendDiscovery contentItems={contentItems} />;
      case 'publications-timeline':
        return <AAVEPublicationsTimeline />;
      case 'scholar-api-test':
        return <ScholarApiTester />;
      default:
        return <AAVEPublicationsTimeline/>;
    }
  };

  return (
    <div className="App">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="responsive-container">
        {error && (
          <div className="error-banner">
            {error}
            {window.location.hostname === 'localhost' && (
              <div>
                <p>Detected local development. API base URL: {apiBaseUrl}</p>
                <button onClick={() => setCurrentView('api-test')}>Test API Connection</button>
              </div>
            )}
          </div>
        )}
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;