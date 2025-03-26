# AAVE Linguistic Analysis in Academic and News Sources

A specialized tool for tracking and analyzing African American Vernacular English (AAVE) patterns in academic articles and news sources.

## Project Overview

This application tracks the prevalence of AAVE in academic publications and news media, analyzing linguistic patterns based on established research. The project is inspired by research from the paper "LOW-RESOURCE LANGUAGE MODEL WITH CYBER DEFENSE" which explores unique phonemes and morphemes structures of languages including AAVE.

## Key Features

- **Data Collection**: Gather content from news sources and academic articles
- **Linguistic Analysis**: Identify and categorize AAVE language features
- **Trend Visualization**: Track prevalence of AAVE patterns over time
- **Source Comparison**: Compare representation in academic vs news sources

## Technologies

- React with TypeScript for the frontend
- Node.js/Express backend
- Google Scholar API for academic article data
- News API for current news sources
- Chart.js for visualization

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with API keys:

REACT_APP_NEWS_API_KEY=your_news_api_key 
RAPID_API_KEY=your_rapid_api_key

4. Start the server: `npm run server`
5. Start the client: `npm start`

## Linguistic Features Analyzed

- Copula deletion
- Habitual "be"
- Multiple negation
- Completive "done"
- Remote time "been"
- Absence of third-person singular -s
- Use of "ain't"

## Research References

This project builds upon academic research on AAVE linguistics:

- "LOW-RESOURCE LANGUAGE MODEL WITH CYBER DEFENSE" (ResearchGate, 2022)