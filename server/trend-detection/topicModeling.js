const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TopicModeler {
  constructor() {
    this.pythonScriptPath = path.join(__dirname, 'python', 'bertopic_model.py');
    this.dataDir = path.join(__dirname, '../data/trends');
    
    // Ensure directories exist
    if (!fs.existsSync(path.join(__dirname, 'python'))) {
      fs.mkdirSync(path.join(__dirname, 'python'), { recursive: true });
    }
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Extract topics from a collection of content items
   * @param {Array} contentItems - Array of content items with text to analyze
   * @param {Object} options - Additional options for topic modeling
   * @returns {Promise<Object>} - Topics and their associated content
   */
  cleanTopicNames(results) {
    const stopwords = ['hours', 'created', 'content', 'ago'];
    
    if (results.topicDetails) {
      Object.keys(results.topicDetails).forEach(topicId => {
        const topic = results.topicDetails[topicId];
        
        // Filter out common words from the name
        const nameParts = topic.name.split(' ').filter(word => 
          !stopwords.includes(word) && word.length > 1
        );
        
        // Use filtered words or default to original name if empty
        topic.name = nameParts.length > 0 
          ? nameParts.join(' ') 
          : topic.name;
      });
    }
    
    return results;
  }

  async extractTopics(contentItems, options = {}) {
    try {
      console.log(`Extracting topics from ${contentItems.length} content items`);
      
      // Prepare input data for Python script
      const inputFile = path.join(this.dataDir, `input_${Date.now()}.json`);
      const outputFile = path.join(this.dataDir, `output_${Date.now()}.json`);
      
      // Extract just the content and IDs for topic modeling
      const textData = contentItems.map(item => ({
        id: item.id,
        text: item.content,
        timestamp: item.timestamp
      }));
      
      // Write input data to file
      fs.writeFileSync(inputFile, JSON.stringify(textData));
      
      // Setup options for Python script
      const pythonOptions = {
        inputFile,
        outputFile,
        numTopics: options.numTopics || 10,
        minClusterSize: options.minClusterSize || 5
      };
      
      // Call Python script to perform topic modeling
      await this.runPythonScript(pythonOptions);
      
      // Read and parse the results
      const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      
      // Clean up temporary files
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);

      return this.cleanTopicNames(results);
      
    } catch (error) {
      console.error('Topic modeling error:', error);
      
      // Return a basic structure in case of error
      return {
        topics: [],
        topicDetails: {},
        error: error.message
      };
    }
  }

  /**
   * Execute Python BERTopic script as a child process
   * @param {Object} options - Options to pass to the Python script
   * @returns {Promise} - Resolves when Python script completes
   */
  runPythonScript(options) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [
        this.pythonScriptPath,
        JSON.stringify(options)
      ]);
      
      let outputData = '';
      let errorData = '';
      
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
        console.log(`Python stdout: ${data}`);
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python stderr: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        } else {
          resolve(outputData);
        }
      });
    });
  }
}

module.exports = new TopicModeler();