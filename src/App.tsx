import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import CulturalDomainTracker from './components/CulturalDomainTracker';
import Dashboard from './components/Dashboard';
import Insights from './components/Insights';
import About from './components/About';
import { ContentItem } from './services/domainTracker';
import contentFetcher from './services/contentFetcher';

function App() {
  const [currentView, setCurrentView] = useState<string>('domains');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Fetch content when component mounts
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const content = await contentFetcher.fetchAllContent();
        setContentItems(content);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomain(domainId);
    console.log(`Selected domain: ${domainId}`);
  };

  const renderCurrentView = () => {
    if (loading) {
      return <div className="loading">Loading content...</div>;
    }

    switch (currentView) {
      case 'domains':
        return (
          <CulturalDomainTracker 
            contentItems={contentItems}
            onDomainSelect={handleDomainSelect}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            contentItems={contentItems}
            selectedDomain={selectedDomain || undefined}
          />
        );
      case 'insights':
        return <Insights contentItems={contentItems} />;
      case 'about':
        return <About />;
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
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;