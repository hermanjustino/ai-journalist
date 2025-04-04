# AI Cultural Journalist: AAVE Discourse Analysis Platform

An autonomous platform tracking and analyzing academic and news articles that discuss African American Vernacular English (AAVE) through sentiment analysis and content classification.

## Project Vision

This autonomous application monitors the discourse surrounding African American Vernacular English in academic publications and news media. By collecting articles that discuss AAVE and applying sentiment analysis, we provide data-driven insights into how Black language is portrayed, studied, and discussed in different contexts. The platform reveals trends in academic recognition, public discourse, and sentiment towards AAVE over time.

## Core Capabilities

- **Automated Article Collection**: Collects articles and publications that discuss AAVE from academic and news sources daily
- **Sentiment Analysis**: Analyzes the emotional tone and attitudes expressed in discourse about AAVE
- **Academic Context Analysis**: Examines how AAVE is studied, cited, and discussed in scholarly contexts
- **Discourse Tracking**: Categorizes and monitors different types of discussions about AAVE
- **Trend Visualization**: Provides data visualizations of changing discourse patterns over time

## Autonomous Architecture

The platform operates on an autonomous cycle:

1. **Automated Data Collection**: The system periodically collects articles mentioning AAVE from news and academic APIs
2. **Content Classification**: Articles are categorized by topic, approach, and context
3. **Sentiment Analysis**: The system analyzes emotional tone and attitude toward AAVE in the content
4. **Academic Relationship Mapping**: For scholarly articles, citation patterns and academic context are tracked
5. **Results Storage and Tracking**: Analysis results are stored for monitoring changes over time
6. **Dashboard Updates**: Visualizations update automatically to show the latest discourse trends

## Content Analysis Categories

The platform analyzes how AAVE is discussed through multiple lenses:

- Educational context discussions
- Linguistic research papers
- Cultural recognition articles
- Social commentary
- Historical documentation

## Technology Stack

- **Frontend**: React with TypeScript, Chart.js for data visualization
- **Backend**: Node.js/Express server
- **Data Sources**: 
  - News API for current articles
  - Google Scholar data via Node.js scholarly packages
- **Analysis**: 
  - Natural Language Processing for topic classification
  - Sentiment analysis algorithms
  - Citation pattern tracking

## Research Foundation

This project builds upon research in linguistics, media studies, and sentiment analysis to examine how AAVE is discussed in institutional contexts:

- Studies on media representation of linguistic diversity
- Research on academic discourse and citation patterns
- Sentiment analysis methodologies applied to cultural discourse

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up API keys in `.env` file
4. Start the Python service: `npm run start-python-api`
5. Start the Node.js server: `npm run server`
6. Start the React client: `npm start`
7. Or use `npm run start-all` to launch everything

## Contributing

Contributions that enhance sentiment analysis, expand content classification, or improve data visualization are welcome.