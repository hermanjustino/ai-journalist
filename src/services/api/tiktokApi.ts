/**
 * TikTok API Service
 * 
 * This service integrates with RapidAPI's TikTok API (100 requests/month free tier)
 * combined with mock data to provide a consistent stream of TikTok content.
 * 
 * Features:
 * - Uses RapidAPI's TikTok search endpoint for real content when available
 * - Falls back to culturally relevant mock data when API limits are reached
 * - Augments API results with mock data when needed to meet requested content count
 * 
 * Note: Mock data is carefully crafted to represent Black cultural domains accurately
 * and can be used for development/testing without consuming API quota.
 */

import axios from 'axios';
import { ContentItem } from '../domainTracker';

const API_URL = 'http://localhost:3001/api';

export class TikTokApiService {
    /**
     * Search for TikTok content based on provided keywords and options
     */
    async searchTikToks(keywords: string[], options: {
        startDate?: Date,
        endDate?: Date,
        limit?: number
    } = {}): Promise<ContentItem[]> {
        try {
            // Call the backend proxy server that uses RapidAPI
            const response = await axios.post(`${API_URL}/tiktok/search`, {
                keywords,
                startDate: options.startDate?.toISOString(),
                endDate: options.endDate?.toISOString(),
                limit: options.limit || 3 // Limit to 3 by default to conserve API calls
            });

            // Convert timestamps to Date objects
            const apiResults = response.data.map((tiktok: any) => ({
                ...tiktok,
                timestamp: new Date(tiktok.timestamp)
            }));

            // Check if the API response includes a quota exceeded flag
            if (apiResults.some((item: any) => item.quotaExceeded)) {
                console.warn('TikTok API monthly quota exceeded, using mock data');
                // Maybe show a user notification here
            }

            // Check if we need to supplement with mock data (if RapidAPI returned less than requested)
            if (apiResults.length < (options.limit || 3) && !apiResults.some((item: any) => item.isMockData)) {
                const mockData = this.generateRelevantMockData(keywords, options.limit || 3 - apiResults.length);
                return [...apiResults, ...mockData.slice(0, options.limit || 3 - apiResults.length)];
            }

            // Remove any mock data flag before returning
            return apiResults.map((item: any) => {
                const { isMockData, ...rest } = item;
                return rest;
            });

        } catch (error) {
            console.error('TikTok API error:', error);

            // Return culturally relevant mock data on failure
            return this.generateRelevantMockData(keywords, options.limit || 3);
        }
    }

    /**
     * Generate culturally relevant mock data based on keywords
     */
    private generateRelevantMockData(keywords: string[], count: number): ContentItem[] {
        // Base content that's culturally relevant
        const culturalContent = [
            {
                id: `tt-mock-${Date.now()}-1`,
                source: 'tiktok',
                content: `Black linguistic evolution: How AAVE terms like "${keywords.includes('aave') ? 'code-switching' : 'vernacular'}" shape modern communication #blackculture #language #aave`,
                timestamp: new Date(),
                author: '@linguisticsscholar',
                title: 'Understanding AAVE and its cultural impact'
            },
            {
                id: `tt-mock-${Date.now()}-2`,
                source: 'tiktok',
                content: `Jazz history lesson: From ${keywords.includes('jazz') ? 'bebop to fusion' : 'spirituals to swing'} - the evolution of Black musical innovation #blackmusic #jazztradition`,
                timestamp: new Date(Date.now() - 86400000), // 1 day ago
                author: '@musichistorian',
                title: 'Black Musical Traditions'
            },
            {
                id: `tt-mock-${Date.now()}-3`,
                source: 'tiktok',
                content: `Civil rights movement teaching: ${keywords.includes('civil rights') ? 'Voting Rights Act' : 'Freedom Riders'} - stories we don't learn in school #blackhistory #civilrights`,
                timestamp: new Date(Date.now() - 172800000), // 2 days ago
                author: '@historyprofessor',
                title: 'Civil Rights Education Series'
            },
            {
                id: `tt-mock-${Date.now()}-4`,
                source: 'tiktok',
                content: `Black tech innovators spotlight: ${keywords.includes('technology') ? 'Dr. Mark Dean' : 'Dr. Gladys West'} and their contributions to modern computing #blackintech #innovation`,
                timestamp: new Date(Date.now() - 259200000), // 3 days ago
                author: '@techdiversity',
                title: 'Black Innovation Spotlight'
            }
        ];

        // Filter by keywords if provided
        if (keywords.length > 0) {
            const filteredContent = culturalContent.filter(item =>
                keywords.some(keyword =>
                    item.content.toLowerCase().includes(keyword.toLowerCase()) ||
                    item.title.toLowerCase().includes(keyword.toLowerCase())
                )
            );
            return filteredContent.length > 0 ? filteredContent.slice(0, count) : culturalContent.slice(0, count);
        }

        return culturalContent.slice(0, count);
    }
}

export default new TikTokApiService();