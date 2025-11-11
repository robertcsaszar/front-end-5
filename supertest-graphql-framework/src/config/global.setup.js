/**
 * Global Setup
 * Runs once before all tests
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

module.exports = async () => {
  console.log('\n🚀 Setting up test environment...\n');
  
  // Create necessary directories
  const directories = [
    config.logging.dir,
    config.reporting.dir,
    config.csv.tempDir,
    path.join(config.reporting.dir, 'allure-results'),
    path.join(config.reporting.dir, 'screenshots')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
  
  // Clean up old reports
  const cleanupDirs = [
    path.join(config.reporting.dir, 'allure-results'),
    config.csv.tempDir
  ];
  
  cleanupDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        fs.unlinkSync(path.join(dir, file));
      });
      console.log(`✓ Cleaned directory: ${dir}`);
    }
  });
  
  console.log('\n✅ Test environment setup completed\n');
};
