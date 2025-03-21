import React, { useState, useEffect } from 'react';
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

function App() {
  const [currentView, setCurrentView] = useState<string>('domains');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  
  
  // Fetch content on mount
  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    setLoading(true);
    try {
      // Fetch content from multiple sources
      const twitterContent = await contentFetcher.fetchFromTwitter();
      const newsContent = await contentFetcher.fetchFromNews();
      
      // Try to get TikTok content as well
      let tiktokContent: any[] = [];
      try {
        const tiktokApi = (await import('./services/api/tiktokApi')).default;
        tiktokContent = await tiktokApi.searchTikToks(['black culture', 'black excellence'], {
          limit: 10
        });
      } catch (tiktokErr) {
        console.warn('TikTok content fetch failed, continuing without it:', tiktokErr);
      }
      
      // Combine and format all content
      const allContent: ContentItem[] = [
        ...twitterContent.map(formatContent),
        ...newsContent.map(formatContent),
        ...tiktokContent.map(formatContent)
      ];
      
      if (allContent.length === 0) {
        throw new Error('No content retrieved from APIs');
      }
      
      setContentItems(allContent);
      console.log(`Loaded ${allContent.length} content items`);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content. Please check API connections or try again later.');
    } finally {
      setLoading(false);
    }
  };
  
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
      
      <main>
        {error && <div className="error-banner">{error}</div>}
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;