import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import './AAVEPublicationsTimeline.css';

interface Paper {
  paperId?: string;
  title?: string;
  year?: number;
  publicationDate?: string;
  pub_year?: string | number; 
  publishedAt?: string;
  author?: string | string[];
  venue?: string;
  journal?: string;
  abstract?: string;
  url?: string;
}

interface YearCount {
  year: number;
  count: number;
}

const LOCAL_STORAGE_KEY = 'aave_publications_data';
const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000;

const AAVEPublicationsTimeline: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [yearCounts, setYearCounts] = useState<YearCount[]>([]);
  const [totalPapers, setTotalPapers] = useState<number>(0);
  const [rawPapers, setRawPapers] = useState<Paper[]>([]);
  const [showRawData, setShowRawData] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'cache' | 'api' | 'sample'>('cache');

  useEffect(() => {
    fetchAAVEPublications();
  }, []);

  useEffect(() => {
    if (yearCounts.length > 0 && chartRef.current) {
      renderChart();
    }
  }, [yearCounts]);

  const fetchAAVEPublications = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Only check localStorage for cached data if not forcing refresh
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (cachedData) {
          try {
            const { data, timestamp, papers, source } = JSON.parse(cachedData);
            
            // Check if cache is still valid (less than 7 days old)
            if (Date.now() - timestamp < CACHE_EXPIRY_TIME && !data.isSample) {
              console.log('Using cached AAVE publications data');
              setYearCounts(data.yearCounts);
              setTotalPapers(data.totalPapers);
              setRawPapers(papers || []);
              setDataSource(source || 'cache');
              setLoading(false);
              return;
            }
          } catch (cacheError) {
            console.warn('Error parsing cache:', cacheError);
            // Continue with API fetch if cache parsing fails
          }
        }
      } else {
        console.log('Forcing refresh of AAVE publications data');
      }

      // Fix the API base URL logic - this was causing the issue
      let baseUrl;
      if (process.env.REACT_APP_API_BASE_URL) {
        baseUrl = process.env.REACT_APP_API_BASE_URL;
      } else if (window.location.hostname === 'localhost') {
        baseUrl = 'http://localhost:3001';
      } else {
        baseUrl = window.location.origin;
      }
      
      console.log('Fetching AAVE publications from API...', baseUrl);
      
      // Use direct fetch with better handling
      try {
        const response = await fetch(`${baseUrl}/api/scholar/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keywords: ['aave', 'african american vernacular english', 'ebonics'],
            limit: 100,
            forceRefresh // Add force refresh parameter to API call
          }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        // Safety parsing of JSON response
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid JSON response from server');
        }
        
        if (!responseData) {
          throw new Error('Empty response from server');
        }
        
        // Handle different response formats
        let papers: Paper[] = [];
        
        if (Array.isArray(responseData)) {
          papers = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          papers = responseData.data;
        } else if (responseData.error) {
          throw new Error(`Server error: ${responseData.error}`);
        } else {
          console.warn('Unexpected response format:', responseData);
          throw new Error('Unexpected response format from server');
        }
        
        console.log('API returned', papers.length, 'papers');
        setRawPapers(papers);
        setDataSource('api');
        processPapers(papers);
      } catch (apiError) {
        console.error('API error:', apiError);
        throw apiError;
      }
    } catch (err) {
      console.error("Error fetching AAVE publications:", err);
      setError(`Error fetching publications: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Try to load cached data as fallback
      if (!forceRefresh && tryLoadingCachedData()) {
        // Successfully loaded from cache
        console.log('Successfully loaded data from cache as fallback');
      } else {
        // Show empty results instead of generating sample data
        setYearCounts([]);
        setTotalPapers(0);
        setRawPapers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const tryLoadingCachedData = () => {
    try {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const { data, papers, source } = JSON.parse(cachedData);
        if (data && data.yearCounts && data.yearCounts.length > 0) {
          setYearCounts(data.yearCounts);
          setTotalPapers(data.totalPapers || 0);
          setRawPapers(papers || []);
          setDataSource(source || 'cache');
          console.log('Loaded cached data as fallback');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return false;
    }
  };

  const processPapers = (papers: Paper[]) => {
    // Filter and process papers with valid year information
    const validPapers = papers.filter(paper => {
      try {
        if (typeof paper.year === 'number' && !isNaN(paper.year) && paper.year > 1900) 
          return true;
        
        if (paper.pub_year) {
          const parsedYear = typeof paper.pub_year === 'string' ? 
                           parseInt(paper.pub_year, 10) : paper.pub_year;
          if (!isNaN(parsedYear) && parsedYear > 1900) {
            paper.year = parsedYear;
            return true;
          }
        }
        
        // Try date strings
        const tryParseDate = (dateStr?: string) => {
          if (!dateStr) return null;
          try {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            if (!isNaN(year) && year > 1900) return year;
            return null;
          } catch (e) {
            return null;
          }
        };
        
        const pubDateYear = tryParseDate(paper.publicationDate);
        if (pubDateYear) {
          paper.year = pubDateYear;
          return true;
        }
        
        const publishedAtYear = tryParseDate(paper.publishedAt);
        if (publishedAtYear) {
          paper.year = publishedAtYear;
          return true;
        }
        
        return false;
      } catch (e) {
        console.warn('Error processing paper:', e);
        return false;
      }
    });
    
    console.log(`Filtered ${validPapers.length} papers with valid years`);
    
    // Count papers by year
    const counts: Record<number, number> = {};
    validPapers.forEach(paper => {
      if (paper.year && paper.year > 1900) {
        counts[paper.year] = (counts[paper.year] || 0) + 1;
      }
    });
    
    // Convert to array and sort by year
    const yearCountArray = Object.entries(counts)
      .map(([year, count]) => ({
        year: parseInt(year, 10),
        count
      }))
      .sort((a, b) => a.year - b.year);
    
    const total = validPapers.length;
    
    // Update state
    setYearCounts(yearCountArray);
    setTotalPapers(total);
    
    // Cache results
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        data: {
          yearCounts: yearCountArray,
          totalPapers: total
        },
        papers: validPapers,
        timestamp: Date.now(),
        source: 'api'
      }));
    } catch (e) {
      console.warn('Failed to cache results:', e);
    }
  };

  const renderChart = () => {
    if (!chartRef.current) return;
    
    try {
      // Clean up previous chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) {
        console.error('Failed to get chart context');
        return;
      }
      
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: yearCounts.map(item => item.year.toString()),
          datasets: [{
            label: 'Number of Publications',
            data: yearCounts.map(item => item.count),
            backgroundColor: 'rgba(141, 35, 39, 0.7)',
            borderColor: 'rgba(141, 35, 39, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'AAVE Research Publications Over Time',
              font: { size: 16 }
            },
            tooltip: {
              callbacks: {
                label: (context) => `Publications: ${context.parsed.y}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Number of Publications' }
            },
            x: {
              title: { display: true, text: 'Year' }
            }
          }
        }
      });
    } catch (chartError) {
      console.error('Error rendering chart:', chartError);
    }
  };

  // Add this function to the component
  const debugApiConnection = async () => {
    try {
      // Determine the base URL the same way as the fetch function
      let baseUrl;
      if (process.env.REACT_APP_API_BASE_URL) {
        baseUrl = process.env.REACT_APP_API_BASE_URL;
      } else if (window.location.hostname === 'localhost') {
        baseUrl = 'http://localhost:3001';
      } else {
        baseUrl = window.location.origin;
      }
      
      console.log('Testing API connection to:', baseUrl);
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();
      console.log('API health check result:', data);
      return data;
    } catch (err) {
      console.error('API connection test failed:', err);
      return null;
    }
  };

  // Format author information
  const formatAuthor = (author: string | string[] | undefined): string => {
    if (!author) return 'Unknown';
    if (Array.isArray(author)) return author.join(', ');
    return author;
  };

  // Format paper display
  const renderPapersList = () => {
    if (rawPapers.length === 0) {
      return <div className="no-papers">No papers to display</div>;
    }

    // Sort papers by year (most recent first)
    const sortedPapers = [...rawPapers]
      .filter(paper => paper.title) // Filter out papers without titles
      .sort((a, b) => {
        const yearA = a.year || 0;
        const yearB = b.year || 0;
        return yearB - yearA;
      });

    return (
      <div className="papers-list">
        <p className="papers-count">Showing {sortedPapers.length} papers from {dataSource} data</p>
        {sortedPapers.map((paper, index) => (
          <div key={paper.paperId || `paper-${index}`} className="paper-item">
            <h4 className="paper-title">{paper.title}</h4>
            <div className="paper-meta">
              <span className="paper-year">Year: {paper.year || 'Unknown'}</span>
              <span className="paper-author">Author(s): {formatAuthor(paper.author)}</span>
              {(paper.venue || paper.journal) && 
                <span className="paper-venue">Journal: {paper.venue || paper.journal}</span>
              }
            </div>
            {paper.abstract && <p className="paper-abstract">{paper.abstract}</p>}
            {paper.url && 
              <a href={paper.url} target="_blank" rel="noopener noreferrer" className="paper-link">
                View Source
              </a>
            }
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="publications-timeline">
      <div className="timeline-header">
        <h2>AAVE in Academic Publications</h2>
        <p>Timeline of academic publications mentioning African American Vernacular English over the years</p>
        <div className="timeline-actions">
          <button 
            onClick={() => fetchAAVEPublications(true)}
            className="refresh-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          <button 
            onClick={() => setShowRawData(!showRawData)}
            className="toggle-data-button"
            disabled={rawPapers.length === 0}
          >
            {showRawData ? 'Hide Paper List' : 'Show Paper List'}
          </button>
          <span className="data-source-label">
            Data source: <strong>{dataSource}</strong>
          </span>
        </div>
        {error && (
          <div className="error-message">
            {error}
            {window.location.hostname === 'localhost' && (
              <div>
                <button 
                  onClick={async () => {
                    const result = await debugApiConnection();
                    alert(result ? `API connection successful: ${JSON.stringify(result)}` : 'API connection failed');
                  }}
                  style={{ marginTop: '10px', padding: '5px 10px' }}
                >
                  Test API Connection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching publications data...</p>
        </div>
      ) : yearCounts.length === 0 ? (
        <div className="no-data-message">
          <p>No publication data available. Please check your API connection and try again.</p>
        </div>
      ) : (
        <>
          <div className="timeline-stats">
            <div className="stat-card">
              <h3>Total Publications</h3>
              <div className="stat-value">{totalPapers || yearCounts.reduce((sum, item) => sum + item.count, 0)}</div>
            </div>
            <div className="stat-card">
              <h3>First Publication</h3>
              <div className="stat-value">
                {yearCounts.length > 0 ? yearCounts[0].year : 'N/A'}
              </div>
            </div>
            <div className="stat-card">
              <h3>Peak Year</h3>
              <div className="stat-value">
                {yearCounts.length > 0 
                  ? yearCounts.reduce((max, item) => item.count > max.count ? item : max, yearCounts[0]).year
                  : 'N/A'}
              </div>
            </div>
          </div>
          
          {!showRawData && (
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          )}
          
          {showRawData && renderPapersList()}
          
          <div className="timeline-explanation">
            <h3>About this Data</h3>
            <p>
              This chart shows the number of academic publications that mention "African American Vernacular English", 
              "AAVE", or "Ebonics" in their title or abstract, by year of publication.
              {dataSource !== 'sample' ? " The data is sourced from academic databases." : " Sample data is shown due to connection issues."}
            </p>
            <p>
              The trend illustrates how academic interest in AAVE has evolved over time, reflecting changing 
              research priorities and the growing recognition of African American Vernacular English as an important 
              area of linguistic study.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AAVEPublicationsTimeline;
