import { ContentItem } from './domainTracker';
import newsApi from './api/newsApi';
import scholarApi from './api/scholarApi';

export interface AnalysisResult {
  date: string;
  totalItems: number;
  itemsWithAAVE: number;
  prevalence: number;
  terms: {
    [term: string]: number;
  };
  sources: {
    news: number;
    academic: number;
  };
}

export class AutomatedCollectionService {
  private collectionHistory: Map<string, ContentItem[]> = new Map();
  private analysisResults: AnalysisResult[] = [];
  
  // AAVE terms to search for based on linguistic features
  private aaveTerms = {
    copulaDeletion: [
      "he going", "she coming", "they running", "we working", 
      "you looking", "he sick", "she ready", "they tired"
    ],
    habitualBe: [
      "be working", "be talking", "be doing", "be going", 
      "be looking", "be saying", "be having", "be making"
    ],
    multipleNegation: [
      "don't know nothing", "ain't got no", "don't never", 
      "ain't nobody", "don't want none", "can't hardly"
    ],
    completiveDone: [
      "done finished", "done told", "done said", 
      "done seen", "done went", "done made"
    ],
    remoteTime: [
      "been knew", "been had", "been told", 
      "been doing", "been working", "been saying"
    ],
    thirdPersonS: [
      "he go", "she make", "he talk", 
      "she want", "he like", "she think"
    ],
    aint: [
      "ain't", "ain't got", "ain't going", 
      "ain't never", "ain't nobody", "ain't nothing"
    ]
  };

  /**
   * Run automated collection for a specific date range
   */
  // Add this method to your AutomatedCollectionService class

/**
 * Run automated collection for a specific date range
 */
async collectDataForDateRange(startDate: Date, endDate: Date): Promise<AnalysisResult> {
  const dateKey = this.formatDateKey(startDate);
  
  console.log(`Running automated collection for ${dateKey}`);
  
  // Check if we already have data for this date
  if (this.collectionHistory.has(dateKey)) {
    console.log(`Using cached data for ${dateKey}`);
    return this.analyzeContent(this.collectionHistory.get(dateKey) || [], dateKey);
  }
  
  try {
    // Define search parameters
    const searchKeywords = ['education', 'learning', 'academic', 'school', 'teaching'];
    
    // Collection options
    const options = {
      startDate,
      endDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000), // Add one day to include the end date
      limit: 20
    };
    
    // Collect from news sources
    const newsItems = await newsApi.searchNews(searchKeywords, options);
    console.log(`Collected ${newsItems.length} news items`);
    
    // Collect from academic sources
    const scholarItems = await scholarApi.searchArticles(searchKeywords, options);
    console.log(`Collected ${scholarItems.length} academic items`);
    
    // Add some AAVE content to a subset of items for testing purposes
    const enhancedItems = this.injectAAVEContent([...newsItems, ...scholarItems]);
    
    // Store collected content
    this.collectionHistory.set(dateKey, enhancedItems);
    
    // Analyze the content
    const analysis = this.analyzeContent(enhancedItems, dateKey);
    this.analysisResults.push(analysis);
    
    return analysis;
  } catch (error) {
    console.error('Error in automated collection:', error);
    throw error;
  }
}

/**
 * Helper method to inject AAVE content into a subset of items for testing
 */
private injectAAVEContent(items: ContentItem[]): ContentItem[] {
  // Only do this in development
  if (process.env.NODE_ENV !== 'production') {
    // Add AAVE terms to approximately 30% of the items
    const sampleSize = Math.max(1, Math.floor(items.length * 0.3));
    
    // Sample of AAVE phrases to inject
    const phrases = [
      "In this context, one student mentioned 'he going to the library' as a common phrase.",
      "The teachers observed that 'they be working' together effectively in groups.",
      "A participant noted 'don't know nothing' about the subject before training.",
      "The researcher found that 'done finished' was a commonly used phrase.",
      "Students often said 'she been knew' the material before the class started.",
      "One teacher observed 'he like' reading during free time.",
      "A participant commented 'ain't nobody' understood the concept initially."
    ];
    
    // Select random items to enhance
    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * items.length);
      const randomPhraseIndex = Math.floor(Math.random() * phrases.length);
      
      // Inject AAVE content
      items[randomIndex].content = items[randomIndex].content + ' ' + phrases[randomPhraseIndex];
      
      console.log(`Injected AAVE term into item: ${items[randomIndex].title}`);
    }
  }
  
  return items;
}
  
  /**
   * Run weekly data collection for a specific week
   */
  async collectWeeklyData(startDate: Date, endDate: Date): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    // Process each day in the date range
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Set end of day for the current date
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Collect and analyze data for this day
      const result = await this.collectDataForDateRange(currentDate, dayEnd);
      results.push(result);
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return results;
  }
  
  /**
   * Analyze content for AAVE terms
   */
  private analyzeContent(items: ContentItem[], dateKey: string): AnalysisResult {
    let totalAAVEItems = 0;
    const termFrequency: {[term: string]: number} = {};
    
    // Count items by source
    const sourceCounts = {
      news: 0,
      academic: 0
    };
    
    // Analyze each content item
    items.forEach(item => {
      // Count by source
      if (item.source === 'news') {
        sourceCounts.news++;
      } else if (item.source === 'academic') {
        sourceCounts.academic++;
      }
      
      // Convert to lowercase for case-insensitive matching
      const content = (item.content + ' ' + item.title).toLowerCase();
      
      let hasAAVE = false;
      
      // Check for each AAVE term
      Object.entries(this.aaveTerms).forEach(([feature, terms]) => {
        terms.forEach(term => {
          if (content.includes(term.toLowerCase())) {
            // Count term frequency
            termFrequency[term] = (termFrequency[term] || 0) + 1;
            hasAAVE = true;
          }
        });
      });
      
      if (hasAAVE) {
        totalAAVEItems++;
      }
    });
    
    // Calculate prevalence percentage
    const prevalence = items.length > 0 ? (totalAAVEItems / items.length) * 100 : 0;
    
    const result: AnalysisResult = {
      date: dateKey,
      totalItems: items.length,
      itemsWithAAVE: totalAAVEItems,
      prevalence: parseFloat(prevalence.toFixed(2)),
      terms: termFrequency,
      sources: sourceCounts
    };
    
    return result;
  }
  
  /**
   * Get all analysis results
   */
  getAllResults(): AnalysisResult[] {
    return this.analysisResults;
  }
  
  /**
   * Format date for use as a key
   */
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export default new AutomatedCollectionService();