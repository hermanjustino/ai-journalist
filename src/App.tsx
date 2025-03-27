import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import About from './components/About';
import ApiTester from './components/ApiTester';
import ApiUsageDashboard from './components/ApiUsageDashboard';
import TrendDiscovery from './components/TrendDiscovery/TrendDiscovery';
import DataCollection from './components/DataCollection';
import ArticleGenerator from './components/ArticleGenerator/ArticleGenerator';
import Insights from './components/Insights';
import Dashboard from './components/Dashboard';
import CulturalDomainTracker from './components/CulturalDomainTracker';
import { ContentItem } from './services/domainTracker';
import contentFetcher from './services/contentFetcher';
import './App.css';
import AutomatedAAVEDashboard from './components/AAVEDashboard/AutomatedAAVEDashboard';

function App() {
  const [currentView, setCurrentView] = useState<string>('domains');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

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
    setLoading(false); // Always ensure loading is set to false
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

  // Handle newly collected content
  const handleContentCollected = (items: ContentItem[]) => {
    const formattedItems = items.map(formatContent);
    setContentItems([...formattedItems, ...contentItems]);
    console.log(`Added ${items.length} new content items`);
  };

  // Handle domain selection
  const handleDomainSelect = (domainId: string) => {
    setSelectedDomain(domainId);
    // Optionally switch to dashboard view when domain is selected
    setCurrentView('dashboard');
  };

  // Render the current view with consistent data
  const renderCurrentView = () => {
    if (loading) {
      return <div className="loading-container">Loading content data...</div>;
    }

    switch (currentView) {
      case 'domains':
        return <CulturalDomainTracker
          contentItems={contentItems}
          onDomainSelect={handleDomainSelect}
        />;
      case 'dashboard':
        return <Dashboard
          contentItems={contentItems}
          selectedDomain={selectedDomain}
        />;
      case 'insights':
        return <Insights contentItems={contentItems} />;
      case 'collection':
        return <DataCollection onContentCollected={handleContentCollected} />;
      case 'aave-analysis':
        return <AutomatedAAVEDashboard />;
      case 'about':
        return <About />;
      case 'api-test':
        return <ApiTester />;
      case 'api-usage':
        return <ApiUsageDashboard />;
      case 'trends':
        return <TrendDiscovery contentItems={contentItems} />;
      case 'articles':
        return <ArticleGenerator contentItems={contentItems} />;
      default:
        return <div>Coming soon...</div>;
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