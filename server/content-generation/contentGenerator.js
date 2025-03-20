const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ContentGenerator {
    constructor() {
        this.dataDir = path.join(__dirname, '../data/articles');

        // Ensure directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }

        // Gemini API settings
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
        this.modelName = 'gemini-1.5-pro';

        // Log configuration
        if (this.apiKey) {
            console.log(`Gemini API configured with key: ${this.apiKey.substring(0, 4)}...`);
        } else {
            console.warn('No Gemini API key found - will use mock article generation');
        }
    }

    /**
     * Generate an article about a cultural trend
     */
    async generateArticle(trend, topicDetails, relatedContent = []) {
        try {
            console.log(`Generating article for trend: ${trend.name}`);

            // Check if we should use mock articles
            if (process.env.USE_MOCK_ARTICLES === 'true') {
                console.log('Using mock article due to USE_MOCK_ARTICLES flag');
                return this.generateMockArticle({ trend, topicDetails });
            }

            // Prepare content for the model prompt
            const trendContext = this.prepareTrendContext(trend, topicDetails, relatedContent);

            // Generate article using Gemini
            console.log('Calling Gemini API...');
            const article = await this.callLanguageModel(trendContext);
            console.log('Article generation complete');

            // Save the generated article
            return this.saveArticle({
                trend,
                article,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error generating article:', error);

            // Fallback to mock article on error
            console.log('Falling back to mock article due to error');
            return this.generateMockArticle({ trend, topicDetails });
        }
    }

    /**
     * Call the Gemini language model to generate an article
     */
    async callLanguageModel(context) {
        // Without an API key, return mock article
        if (!this.apiKey || !this.genAI) {
            return this.generateMockArticle(context);
        }

        try {
            // Create a prompt for the language model
            const prompt = this.createPrompt(context);

            // Call Gemini API
            const model = this.genAI.getGenerativeModel({ model: this.modelName });

            // Set up generation configuration
            const generationConfig = {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000,
            };

            // Add safety settings
            const safetySettings = [
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
            ];

            // Make the request
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig,
                safetySettings,
            });

            const response = result.response;
            const generatedText = response.text();

            return {
                title: this.extractTitle(generatedText) || `Trending in ${context.trend.name}: New Cultural Movements`,
                content: generatedText,
                model: this.modelName,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Language model API error:', error);
            throw error;
        }
    }

    /**
     * Extract title from generated content
     */
    extractTitle(text) {
        // Look for a title in the first line (often includes ** for bold)
        const firstLine = text.split('\n')[0];

        // Clean up possible markdown formatting
        if (firstLine) {
            return firstLine.replace(/^\s*\*\*|\*\*\s*$/g, '').trim();
        }

        return null;
    }

    /**
     * Create prompt for the language model
     */
    createPrompt(context) {
        const { trend, topicDetails, relatedContent = [] } = context;

        // Format related content samples
        const contentSamples = relatedContent.length > 0
            ? relatedContent.map(item => `- "${item.content}" (by ${item.author || 'Unknown'})`).join('\n')
            : 'No specific content samples available.';

        return `
You are an expert cultural journalist focusing on Black culture. Write an insightful cultural analysis article about a trending topic in ${trend.name}.

Topic information:
- Name: ${trend.name}
- Keywords: ${trend.keywords.join(', ')}
- Trending strength: ${trend.multiplier.toFixed(1)}x normal activity
- Growth velocity: ${(trend.velocity * 100).toFixed(0)}%
${trend.isRecurrent ? `- This is a recurring trend (seen ${trend.occurrences} times before)` : '- This is a new emerging trend'}

Most relevant terms in this topic:
${topicDetails?.wordWeights || trend.keywords.join(', ')}

Recent content samples:
${contentSamples}

Write a well-structured article (about 500-600 words) with:
1. A compelling headline on the first line (make it bold with **)
2. An introduction explaining the trend's origins and current popularity
3. Analysis of its cultural significance within the Black cultural landscape
4. Connections to historical precedents and broader cultural movements
5. Impact on current creative expressions and cultural conversations
6. Potential future developments (grounded in current evidence)

Format the article with a clear headline and well-structured paragraphs. Use a journalistic, informative tone that highlights cultural significance while avoiding speculation or unfounded claims.
`;
    }

    /**
     * Prepare trend context for the prompt
     */
    prepareTrendContext(trend, topicDetails, relatedContent) {
        // Format word weights for the prompt if available
        let wordWeights = '';
        if (topicDetails && topicDetails.words && Array.isArray(topicDetails.words)) {
            wordWeights = topicDetails.words
                .map(word => `${word.word} (${word.weight.toFixed(2)})`)
                .join(', ');
        }

        return {
            trend,
            topicDetails: {
                ...topicDetails,
                wordWeights
            },
            relatedContent
        };
    }

    /**
     * Generate a mock article for testing or fallback
     */
    generateMockArticle(context) {
        const { trend } = context;

        const title = `The Rise of ${trend.name}: A Cultural Analysis`;

        const intro = `A significant trend is emerging in ${trend.name}, showing ${trend.multiplier.toFixed(1)}x normal activity levels.`;

        const body = `
Cultural analysts have noted this movement's importance within broader Black cultural expression. 
Examining the most relevant terms associated with this trend reveals patterns of cultural significance that merit attention.
Content creators across platforms are engaging with these themes in ways that demonstrate both innovation and connection to historical cultural traditions.`;

        const conclusion = `As this trend continues to evolve, it offers valuable insights into contemporary cultural expression and the ongoing development of Black cultural movements in digital and physical spaces.`;

        return {
            title,
            content: `**${title}**\n\n${intro}\n\n${body}\n\n${conclusion}`,
            model: 'mock',
            timestamp: new Date()
        };
    }

    /**
     * Save article to file system
     */
    saveArticle(articleData) {
        // Generate unique ID for the article
        const id = `article_${articleData.trend.id}_${Date.now()}`;
        const filePath = path.join(this.dataDir, `${id}.json`);

        // Extract content from the nested article structure
        const flattenedData = {
            id,
            title: articleData.article?.title || 'Untitled Article',
            content: articleData.article?.content || '',
            model: articleData.article?.model || 'unknown',
            trend: articleData.trend,
            timestamp: articleData.timestamp
        };

        // Save to file
        fs.writeFileSync(filePath, JSON.stringify(flattenedData, null, 2));

        return flattenedData;
    }

    /**
     * Get recently generated articles
     */

    getRecentArticles(limit = 10) {
        try {
            // Get list of article files
            const files = fs.readdirSync(this.dataDir)
                .filter(file => file.startsWith('article_'))
                .sort()
                .reverse()
                .slice(0, limit);

            // Read and parse each file
            return files.map(file => {
                const filePath = path.join(this.dataDir, file);
                let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Handle legacy article structure if needed
                if (data.article && !data.content) {
                    data = {
                        ...data,
                        title: data.article.title,
                        content: data.article.content,
                        model: data.article.model
                    };
                }

                return {
                    id: file.replace('.json', ''),
                    ...data
                };
            });
        } catch (error) {
            console.error('Error getting recent articles:', error);
            return [];
        }
    }
}

module.exports = new ContentGenerator();