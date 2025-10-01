// src/utils/api.js (or a similar utility file)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://gophermarketplace.onrender.com'; // Use your actual Render backend URL

/**
 * Pings the server's health check endpoint to wake it up from hibernation on Render.
 * It will retry a few times with a delay if the server doesn't respond immediately.
 *
 * @param {number} maxRetries The maximum number of times to try.
 * @param {number} delay The delay in milliseconds between retries.
 * @returns {Promise<boolean>} A promise that resolves to true if the server is healthy, false otherwise.
 */
export const warmUpServer = async (maxRetries = 5, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}/healthz`);
      
      // If we get a 200 OK, the server is awake and healthy.
      if (response.ok) {
        console.log('Server is awake and ready!');
        return true;
      }
    } catch (error) {
      // This catch block will likely execute on a 503 or network error
      console.log(`Server not ready, attempt ${i + 1} of ${maxRetries}. Retrying in ${delay / 1000}s...`);
    }
    
    // Wait for the specified delay before the next attempt
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.error('Server did not respond after multiple attempts.');
  return false;
};
