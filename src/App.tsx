import { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import About from './components/About';
import TrendDiscovery from './components/TrendDiscovery/TrendDiscovery';
import Dashboard from './components/Dashboard';
import { ContentItem } from './services/domainTracker';
import contentFetcher from './services/contentFetcher';
import './App.css';
import AAVEPublicationsTimeline from './components/PublicationsTimeline/AAVEPublicationsTimeline';
import AutomatedAAVEDashboard from './components/AAVEDashboard/AutomatedAAVEDashboard';


function App() {
  // Change default view to AAVE dashboard
  const [currentView, setCurrentView] = useState<string>('aave-analysis');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentData = useCallback(async () => {
    setLoading(true);
    try {
      // Only fetch content from news and scholar sources
      let newsContent: any[] = [];
      let scholarContent: any[] = [];
      
      try {
        newsContent = await contentFetcher.fetchFromNews();
        console.log('Retrieved news content:', newsContent.length, 'items');
      } catch (newsErr) {
        console.error('Error fetching news content:', newsErr);
        newsContent = [];
      }
      
      try {
        scholarContent = await contentFetcher.fetchFromScholar();
        console.log('Retrieved scholar content:', scholarContent.length, 'items');
      } catch (scholarErr) {
        console.error('Error fetching scholarly content:', scholarErr);
        scholarContent = [];
      }

      // Combine news and scholar content
      const formattedNewsContent = newsContent.map(formatContent);
      const formattedScholarContent = scholarContent.map(formatContent);
      let allContent: ContentItem[] = [
        ...formattedNewsContent,
        ...formattedScholarContent
      ];

      console.log(`Got ${formattedNewsContent.length} news and ${formattedScholarContent.length} scholar items`);

      if (allContent.length === 0) {
        console.log('No content from APIs, using mock data');
        // If no content, use mock data
        try {
          const mockContent = await contentFetcher.getMockContent(15);
          allContent = mockContent;
          console.log(`Retrieved ${mockContent.length} mock content items`);
        } catch (mockErr) {
          console.error('Error getting mock content:', mockErr);
          allContent = []; // Ensure allContent is an array even if mock data fails
        }
      }

      setContentItems(allContent);
      console.log(`Total items loaded: ${allContent.length}`);
    } catch (err) {
      console.error('Error in content fetching logic:', err);
      setError('Failed to load content. Using mock data instead.');

      try {
        // Fallback to mock content on error
        const mockContent = await contentFetcher.getMockContent(15);
        setContentItems(mockContent);
      } catch (mockErr) {
        console.error('Error even with mock data:', mockErr);
        setContentItems([]); // Empty array as final fallback
      }
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
      case 'aave-analysis':
        return <AutomatedAAVEDashboard contentItems={contentItems} />;
      case 'about':
        return <About />;
      case 'trends':
        return <TrendDiscovery contentItems={contentItems} />;
      case 'publications-timeline':
        return <AAVEPublicationsTimeline />;
      default:
        return <AutomatedAAVEDashboard contentItems={contentItems} />;
    }
  };

  return (
    <div className="App">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="responsive-container">
        {error && <div className="error-banner">{error}</div>}
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;