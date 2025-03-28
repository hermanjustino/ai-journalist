const fs = require('fs');
const path = require('path');

const usageFilePath = path.join(__dirname, '../data/api-usage.json');

try {
  if (fs.existsSync(usageFilePath)) {
    const data = fs.readFileSync(usageFilePath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Remove twitter and tiktok keys
    const { twitter, tiktok, ...cleanedData } = parsed;
    
    // Write back the cleaned data
    fs.writeFileSync(usageFilePath, JSON.stringify(cleanedData, null, 2));
    console.log('Successfully cleaned API usage data');
  } else {
    console.log('No API usage data file found');
  }
} catch (error) {
  console.error('Error cleaning API usage data:', error);
}