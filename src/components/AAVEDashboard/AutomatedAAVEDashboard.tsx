import React, { useState, useEffect } from 'react';
import automatedCollection, { AnalysisResult } from '../../services/automatedCollection';
import { useChart } from '../../hooks/useChart';
import { ContentItem } from '../../services/domainTracker';
import './AutomatedAAVEDashboard.css';

interface AutomatedAAVEDashboardProps {
  contentItems?: ContentItem[];
}

const AutomatedAAVEDashboard: React.FC<AutomatedAAVEDashboardProps> = ({ contentItems = [] }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date('2025-03-18'),
    end: new Date('2025-03-25')
  });
  
  const { chartRef: prevalenceChartRef, renderChart: renderPrevalenceChart } = useChart();
  const { chartRef: termsChartRef, renderChart: renderTermsChart } = useChart();
  const { chartRef: sourcesChartRef, renderChart: renderSourcesChart } = useChart();
  
  // Render charts when results change
  useEffect(() => {
    if (results.length > 0) {
      renderCharts();
    }
  }, [results]);
  
  // Update the collectData function to optionally use provided content items
  const collectData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Starting data collection for AAVE analysis...");
      
      // If we have preloaded contentItems, use them
      if (contentItems && contentItems.length > 0) {
        console.log(`Using ${contentItems.length} preloaded content items`);
        
        // Create dates for analysis (one week)
        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(dateRange.start);
          date.setDate(date.getDate() + i);
          dates.push(date);
        }
        
        // Create analysis result for each date
        const analysisResults: AnalysisResult[] = [];
        
        // Distribute content items across dates
        const itemsPerDay = Math.ceil(contentItems.length / dates.length);
        
        for (let i = 0; i < dates.length; i++) {
          const startIdx = i * itemsPerDay;
          const endIdx = Math.min(startIdx + itemsPerDay, contentItems.length);
          const dateItems = contentItems.slice(startIdx, endIdx);
          
          // Analyze content
          const dateKey = automatedCollection.formatDateKey(dates[i]);
          const analysis = automatedCollection.analyzeContent(dateItems, dateKey);
          
          analysisResults.push(analysis);
        }
        
        setResults(analysisResults);
      } else {
        // Fall back to API calls when no content items provided
        const analysisResults = await automatedCollection.collectWeeklyData(
          dateRange.start,
          dateRange.end
        );
        
        if (analysisResults && analysisResults.length > 0) {
          setResults(analysisResults);
        } else {
          throw new Error("No results returned from data collection");
        }
      }
    } catch (err) {
      console.error('Error collecting AAVE data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to collect and analyze content: ${errorMessage}`);
      
      // Set some sample data to allow visualization
      setResults([{
        date: dateRange.start.toISOString().split('T')[0],
        totalItems: 8,
        itemsWithAAVE: 3,
        prevalence: 37.5,
        terms: { "he going": 2, "they be working": 1 },
        sources: { news: 5, academic: 3 }
      }]);
    } finally {
      setLoading(false);
    }
  };

// Call collectData on component mount
useEffect(() => {
  collectData();
}, []); // Run once when component mounts

  useEffect(() => {
    // Set timeout to prevent infinite loading
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, showing data anyway');
        setLoading(false);
        // If we have results, render them even if incomplete
        if (results.length > 0) {
          renderCharts();
        }
      }, 60000); // 25-second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);
  
  const renderCharts = () => {
    renderPrevalenceOverTimeChart();
    renderTermFrequencyChart();
    renderSourceComparisonChart();
  };
  
  const renderPrevalenceOverTimeChart = () => {
    const config = {
      type: 'line',
      data: {
        labels: results.map(r => r.date),
        datasets: [
          {
            label: 'AAVE Prevalence (%)',
            data: results.map(r => r.prevalence),
            backgroundColor: 'rgba(141, 35, 39, 0.2)',
            borderColor: 'rgba(141, 35, 39, 1)',
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'AAVE Prevalence in Education Content Over Time'
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const result = results[context.dataIndex];
                return [
                  `Prevalence: ${context.raw}%`,
                  `Items with AAVE: ${result.itemsWithAAVE}`,
                  `Total items: ${result.totalItems}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Prevalence (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    };
    
    renderPrevalenceChart(config);
  };
  
  const renderTermFrequencyChart = () => {
    // Combine all term frequencies
    const combinedTerms: {[term: string]: number} = {};
    
    results.forEach(result => {
      Object.entries(result.terms).forEach(([term, count]) => {
        combinedTerms[term] = (combinedTerms[term] || 0) + count;
      });
    });
    
    // Get the top 10 terms
    const topTerms = Object.entries(combinedTerms)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const config = {
      type: 'bar',
      data: {
        labels: topTerms.map(([term]) => term),
        datasets: [
          {
            label: 'Frequency',
            data: topTerms.map(([_, count]) => count),
            backgroundColor: 'rgba(233, 178, 30, 0.7)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Most Common AAVE Terms in Education Content'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Frequency'
            }
          }
        }
      }
    };
    
    renderTermsChart(config);
  };
  
  const renderSourceComparisonChart = () => {
    // Calculate total AAVE items by source
    const newsTotal = results.reduce((sum, result) => sum + result.sources.news, 0);
    const academicTotal = results.reduce((sum, result) => sum + result.sources.academic, 0);
    
    const config = {
      type: 'pie',
      data: {
        labels: ['News Sources', 'Academic Sources'],
        datasets: [
          {
            data: [newsTotal, academicTotal],
            backgroundColor: [
              'rgba(141, 35, 39, 0.7)', // Primary color
              'rgba(233, 178, 30, 0.7)'  // Secondary color
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Content Sources Distribution'
          }
        }
      }
    };
    
    renderSourcesChart(config);
  };
  
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = new Date(value);
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };
  
  const handleRunAnalysis = () => {
    collectData();
  };
  
  if (loading && results.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Collecting and analyzing education content for AAVE terms...</p>
        <p>This may take a moment as we query multiple APIs</p>
      </div>
    );
  }
  
  return (
    <div className="automated-aave-dashboard">
      <div className="dashboard-header">
        <h2>AAVE in Education Content Analysis</h2>
        <p>Automated analysis of AAVE terms in education-related articles and academic papers</p>
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="date-control-panel">
        <div className="date-inputs">
          <div className="date-input">
            <label>Start Date</label>
            <input 
              type="date" 
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
          </div>
          <div className="date-input">
            <label>End Date</label>
            <input 
              type="date" 
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange('end', e.target.value)}
            />
          </div>
        </div>
        <button 
          className="run-analysis-btn"
          onClick={handleRunAnalysis}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>
      
      <div className="analysis-summary">
        <div className="summary-card">
          <h3>Total Content Analyzed</h3>
          <div className="summary-value">
            {results.reduce((sum, r) => sum + r.totalItems, 0)}
          </div>
        </div>
        <div className="summary-card">
          <h3>Items with AAVE</h3>
          <div className="summary-value">
            {results.reduce((sum, r) => sum + r.itemsWithAAVE, 0)}
          </div>
        </div>
        <div className="summary-card">
          <h3>Average Prevalence</h3>
          <div className="summary-value">
            {results.length > 0 
              ? (results.reduce((sum, r) => sum + r.prevalence, 0) / results.length).toFixed(2)
              : 0}%
          </div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>AAVE Prevalence Over Time</h3>
          <div className="chart-container">
            <canvas ref={prevalenceChartRef}></canvas>
          </div>
        </div>
        
        <div className="chart-row">
          <div className="chart-wrapper">
            <h3>Most Common AAVE Terms</h3>
            <div className="chart-container">
              <canvas ref={termsChartRef}></canvas>
            </div>
          </div>
          
          <div className="chart-wrapper">
            <h3>Content Source Distribution</h3>
            <div className="chart-container">
              <canvas ref={sourcesChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div className="detailed-results">
        <h3>Daily Analysis Results</h3>
        <table className="results-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Content</th>
              <th>With AAVE</th>
              <th>Prevalence</th>
              <th>News</th>
              <th>Academic</th>
              <th>Most Common Term</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => {
              // Find most common term for this day
              const topTerm = Object.entries(result.terms)
                .sort((a, b) => b[1] - a[1])
                .shift();
              
              return (
                <tr key={index}>
                  <td>{result.date}</td>
                  <td>{result.totalItems}</td>
                  <td>{result.itemsWithAAVE}</td>
                  <td>{result.prevalence}%</td>
                  <td>{result.sources.news}</td>
                  <td>{result.sources.academic}</td>
                  <td>{topTerm ? `"${topTerm[0]}" (${topTerm[1]})` : 'None'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="aave-explanation">
        <h3>About AAVE Linguistic Features</h3>
        <p>
          African American Vernacular English (AAVE) is a rule-governed linguistic variety with 
          distinct grammatical features. This analysis tracks the following features:
        </p>
        <div className="feature-list">
          <div className="feature-item">
            <h4>Copula Deletion</h4>
            <p>Omission of forms of "to be" (e.g., "he running" instead of "he is running")</p>
          </div>
          <div className="feature-item">
            <h4>Habitual "be"</h4>
            <p>Use of "be" to indicate habitual actions (e.g., "she be working" to indicate "she habitually works")</p>
          </div>
          <div className="feature-item">
            <h4>Multiple Negation</h4>
            <p>Use of multiple negative elements (e.g., "don't know nothing")</p>
          </div>
          <div className="feature-item">
            <h4>Completive "done"</h4>
            <p>Use of "done" to mark completed actions (e.g., "he done finished")</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedAAVEDashboard;