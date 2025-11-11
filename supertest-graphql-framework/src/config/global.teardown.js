/**
 * Global Teardown
 * Runs once after all tests
 */

module.exports = async () => {
  console.log('\n🧹 Cleaning up test environment...\n');
  
  // Add any global cleanup logic here
  // e.g., close database connections, stop mock servers, etc.
  
  console.log('✅ Test environment cleanup completed\n');
};
