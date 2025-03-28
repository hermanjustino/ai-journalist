# AI Cultural Journalist: AAVE Analysis Platform

An autonomous platform tracking and analyzing African American Vernacular English (AAVE) in academic publications and news media through daily analysis.

## Project Vision

This autonomous application monitors the growing presence of Black linguistic contributions in academia and news sources. By analyzing AAVE patterns in scholarly and news content, it provides data-driven insights into how Black language evolves and gains recognition in institutional contexts. The project is built on research from "LOW-RESOURCE LANGUAGE MODEL WITH CYBER DEFENSE" and aims to expand to track other languages from the African diaspora globally.

## Core Capabilities

- **Automated Daily Analysis**: Collects and analyzes new content from academic and news sources daily
- **Linguistic Pattern Recognition**: Identifies established AAVE features in text using advanced NLP
- **Comparative Analysis**: Tracks differences in AAVE representation between academic and media sources
- **Trend Visualization**: Provides data visualizations of changing linguistic patterns over time

## Autonomous Architecture

The platform operates on an autonomous cycle:

1. **Automated Data Collection**: The system periodically collects content from news and academic APIs
2. **AAVE Pattern Analysis**: Content is analyzed for AAVE linguistic features including:
   - Copula deletion (e.g., "he going")
   - Habitual use of "be" (e.g., "they be working")
   - Multiple negation (e.g., "don't know nothing")
   - Completive "done" (e.g., "done finished")
   - Remote time expressed with "been" (e.g., "been knew")
3. **Results Storage and Tracking**: Analysis results are stored for tracking changes over time
4. **Dashboard Updates**: Visualizations update automatically to show the latest AAVE trends

## Future Language Expansion

Beyond AAVE, the platform is designed to eventually incorporate other languages used by Black communities globally:

- Caribbean Creole languages
- West African dialects
- Black British linguistic patterns
- Afro-Brazilian Portuguese variations

## Technology Stack

- **Frontend**: React with TypeScript, Chart.js for data visualization
- **Backend**: Node.js/Express server
- **Data Sources**: 
  - News API for current articles
  - Google Scholar data via Node.js scholarly packages
- **Analysis**: Custom NLP algorithms for AAVE feature detection

## Research Foundation

This project builds upon linguistic research exploring the structures and patterns of AAVE:

- "LOW-RESOURCE LANGUAGE MODEL WITH CYBER DEFENSE" (2022)
- Studies on the grammatical patterns and innovations of AAVE
- Research on linguistic code-switching in academic contexts

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up API keys in `.env` file
4. Start the Python service: `npm run start-python-api`
5. Start the Node.js server: `npm run server`
6. Start the React client: `npm start`
7. Or use `npm run start-all` to launch everything

## Contributing

Contributions that enhance linguistic accuracy, expand language coverage, or improve data visualization are welcome.