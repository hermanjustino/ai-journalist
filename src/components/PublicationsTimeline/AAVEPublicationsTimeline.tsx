import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import './AAVEPublicationsTimeline.css';

interface Paper {
  paperId: string;
  title: string;
  year: number;
  publicationDate?: string;
}

interface YearCount {
  year: number;
  count: number;
}

const LOCAL_STORAGE_KEY = 'aave_publications_data';
const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const AAVEPublicationsTimeline: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [yearCounts, setYearCounts] = useState<YearCount[]>([]);
  const [totalPapers, setTotalPapers] = useState<number>(0);

  useEffect(() => {
    fetchAAVEPublications();
  }, []);

  useEffect(() => {
    if (yearCounts.length > 0 && chartRef.current) {
      renderChart();
    }
  }, [yearCounts]);

  const fetchAAVEPublications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check localStorage for cached data
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        
        // Check if cache is still valid (less than 7 days old)
        if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          console.log('Using cached AAVE publications data');
          setYearCounts(data.yearCounts);
          setTotalPapers(data.totalPapers);
          setLoading(false);
          return;
        }
      }

      // Use our server API instead of calling Semantic Scholar directly
      const response = await fetch('/api/scholar/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: ['aave', 'african american vernacular english', 'ebonics'],
          limit: 1000,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const papers: Paper[] = await response.json();
      
      // Process papers to count by year
      const counts: { [year: number]: number } = {};
      
      papers.forEach(paper => {
        if (paper.year) {
          counts[paper.year] = (counts[paper.year] || 0) + 1;
        }
      });
      
      // Convert to array for chart
      const yearCountArray = Object.entries(counts)
        .map(([year, count]) => ({
          year: parseInt(year),
          count
        }))
        .sort((a, b) => a.year - b.year);
      
      // Calculate total papers
      const total = papers.length;
      
      // Save results to state
      setYearCounts(yearCountArray);
      setTotalPapers(total);
      
      // Cache the results in localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        data: {
          yearCounts: yearCountArray,
          totalPapers: total
        },
        timestamp: Date.now()
      }));
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching AAVE publications:", err);
      setError(`Error fetching publications: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
      
      // Try to load cached data even if it's expired as fallback
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        setYearCounts(data.yearCounts);
        setTotalPapers(data.totalPapers);
      } else {
        // Set sample data for visualization if no cache exists
        setYearCounts([
          { year: 1990, count: 2 },
          { year: 1995, count: 5 },
          { year: 2000, count: 12 },
          { year: 2005, count: 18 },
          { year: 2010, count: 25 },
          { year: 2015, count: 42 },
          { year: 2020, count: 78 },
        ]);
      }
    }
  };

  const renderChart = () => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
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
                font: {
                  size: 16
                }
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
                title: {
                  display: true,
                  text: 'Number of Publications'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Year'
                }
              }
            }
          }
        });
      }
    }
  };

  return (
    <div className="publications-timeline">
      <div className="timeline-header">
        <h2>AAVE in Academic Publications</h2>
        <p>Timeline of academic publications mentioning African American Vernacular English over the years</p>
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {loading && yearCounts.length === 0 ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching publications data...</p>
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
          
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
          
          <div className="timeline-explanation">
            <h3>About this Data</h3>
            <p>
              This chart shows the number of academic publications that mention "African American Vernacular English", 
              "AAVE", or "Ebonics" in their title or abstract, by year of publication. The data is sourced from the 
              Semantic Scholar API, which indexes millions of academic papers across disciplines.
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
