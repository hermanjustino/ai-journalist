import { CulturalDomain } from '../config/culturalDomains';

export interface ContentItem {
  id: string;
  source: string;
  content: string;
  timestamp: Date;
  url?: string;
  author?: string;
  title?: string;
}

export interface DomainMatch {
  domainId: string;
  domainName: string;
  categoryName: string;
  matchedKeywords: string[];
  confidence: number; // 0-1 score
}

export class DomainTracker {
  private domains: CulturalDomain[];

  constructor(domains: CulturalDomain[]) {
    this.domains = domains;
  }

  /**
   * Analyze content to determine which cultural domains it relates to
   */
  analyzeContent(item: ContentItem): DomainMatch[] {
    const matches: DomainMatch[] = [];
    const contentLower = item.content.toLowerCase();

    this.domains.forEach(domain => {
      domain.categories.forEach(category => {
        const matchedKeywords = category.keywords.filter(keyword => 
          contentLower.includes(keyword.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
          // Calculate confidence based on keyword matches and importance
          const keywordRatio = matchedKeywords.length / category.keywords.length;
          const confidence = Math.min(keywordRatio * (domain.importance / 10), 1);

          matches.push({
            domainId: domain.id,
            domainName: domain.name,
            categoryName: category.name,
            matchedKeywords,
            confidence
          });
        }
      });
    });

    // Sort by confidence
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get trending domains based on a collection of content
   */
  getTrendingDomains(items: ContentItem[]): {domainId: string, count: number, avgConfidence: number}[] {
    const domainCounts: Map<string, {count: number, confidenceSum: number}> = new Map();

    items.forEach(item => {
      const matches = this.analyzeContent(item);
      
      matches.forEach(match => {
        const current = domainCounts.get(match.domainId) || {count: 0, confidenceSum: 0};
        domainCounts.set(match.domainId, {
          count: current.count + 1,
          confidenceSum: current.confidenceSum + match.confidence
        });
      });
    });

    return Array.from(domainCounts.entries()).map(([domainId, stats]) => ({
      domainId,
      count: stats.count,
      avgConfidence: stats.confidenceSum / stats.count
    })).sort((a, b) => b.count - a.count);
  }
}