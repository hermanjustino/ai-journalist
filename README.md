# AI Cultural Journalist

A React application that tracks and analyzes Black cultural domains across various media sources, including social media and news outlets.

![Image 2025-03-17 at 5 02 pm](https://github.com/user-attachments/assets/dfba07c4-94a1-459b-b450-e4ba05bf47fa)


## Project Overview

The AI Cultural Journalist project serves as a cultural tracking tool that identifies, categorizes, and analyzes content related to Black culture across several domains. By analyzing content from various sources, it provides insights into trends and connections within Black cultural expressions.

### Cultural Domains Tracked

- **Music**: Hip-Hop/Rap, Jazz, R&B/Soul, Gospel
- **Social Justice & Activism**: Civil Rights, Black Liberation, Contemporary Movements
- **Language & Expression**: AAVE, Slang & Terminology
- **Arts & Literature**: Literature, Visual Arts
- **Innovation & Technology**: Tech Pioneers, STEM

## Features

- **Cultural Domain Tracking**: Define and track specific cultural domains and categories
- **Content Analysis**: Analyze content from various sources to identify cultural references
- **Trend Identification**: Track trending topics and domains in Black culture
- **Domain Insights**: Discover connections between cultural domains and their overlap
- **Interactive UI**: Explore domains, categories, and trending topics

## Project Structure

```
ai-journalist/
├── src/
│   ├── components/              
│   │   ├── About.tsx            
│   │   ├── CulturalDomainTracker.tsx 
│   │   ├── Dashboard.tsx        
│   │   ├── Insights.tsx         
│   │   └── Navigation.tsx       
│   ├── config/                  
│   │   └── culturalDomains.ts   
│   ├── services/                
│   │   ├── contentFetcher.ts    
│   │   └── domainTracker.ts     
│   ├── App.tsx                  
│   └── index.tsx                
└── public/                      
```

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

## How It Works

The application works by:

1. Defining cultural domains and their categories with relevant keywords
2. Fetching content from various sources (currently using mock data)
3. Analyzing content to identify references to cultural domains
4. Calculating trends and connections between domains
5. Presenting insights through an interactive user interface

## Future Development

- **API Integration**: Connect to Twitter, TikTok, and news APIs for real-time data
- **Machine Learning**: Implement NLP for more sophisticated content analysis
- **User Profiles**: Add authentication and personalized insights
- **Data Visualization**: Add charts and graphs to better visualize cultural trends
- **Content Creator Analysis**: Track and analyze influential creators in each domain
- **Historical Analysis**: Compare current trends to historical data

## Technologies Used

- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **CSS**: Custom styling with responsive design
- **Content APIs**: (Placeholder for future implementation)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Black cultural pioneers and creators across all domains
- Open-source community for tools and libraries
