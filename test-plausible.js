const axios = require('axios');
require('dotenv').config();

async function testPlausibleAPI() {
  try {
    // Get the API key and domain from environment variables
    const apiKey = process.env.PLAUSIBLE_API_KEY;
    const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

    console.log('Testing Plausible API with:');
    console.log('API Key:', apiKey ? 'Set (hidden)' : 'Not set');
    console.log('Domain:', domain);

    if (!apiKey) {
      console.error('Error: Plausible API key not configured in .env file');
      return;
    }

    if (!domain) {
      console.error('Error: Plausible domain not configured in .env file');
      return;
    }

    // Test v2 API basic query
    console.log('\nTesting Plausible v2 API basic query...');
    try {
      const queryParams = {
        site_id: domain,
        metrics: ['visitors', 'pageviews', 'bounce_rate'],
        date_range: '7d',
      };

      console.log(
        `Requesting https://plausible.io/api/v2/query with params:`,
        JSON.stringify(queryParams, null, 2)
      );

      const response = await axios.post('https://plausible.io/api/v2/query', queryParams, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Plausible v2 API basic query successful!');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Plausible v2 API basic query failed:');
      logError(error);
    }

    // Test v2 API with dimensions
    console.log('\nTesting Plausible v2 API with dimensions...');
    try {
      const queryParams = {
        site_id: domain,
        metrics: ['visitors', 'pageviews'],
        date_range: '7d',
        dimensions: ['visit:source'],
      };

      console.log(
        `Requesting https://plausible.io/api/v2/query with params:`,
        JSON.stringify(queryParams, null, 2)
      );

      const response = await axios.post('https://plausible.io/api/v2/query', queryParams, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Plausible v2 API with dimensions successful!');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Plausible v2 API with dimensions failed:');
      logError(error);
    }

    // Test v2 API with time dimension
    console.log('\nTesting Plausible v2 API with time dimension...');
    try {
      const queryParams = {
        site_id: domain,
        metrics: ['visitors'],
        date_range: '7d',
        dimensions: ['time:day'],
      };

      console.log(
        `Requesting https://plausible.io/api/v2/query with params:`,
        JSON.stringify(queryParams, null, 2)
      );

      const response = await axios.post('https://plausible.io/api/v2/query', queryParams, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Plausible v2 API with time dimension successful!');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Plausible v2 API with time dimension failed:');
      logError(error);
    }

    console.log('\n---------------------------------------------------');
    console.log('Plausible API v2 testing complete. If you see any failures above:');
    console.log('1. Verify your API key is correct');
    console.log('2. Ensure your domain is registered in Plausible dashboard');
    console.log('3. Check if you have any data in the specified time range');
    console.log('4. Remember that filters may not find any events if tracking is not set up');
  } catch (error) {
    console.error('Error in testing script:', error);
  }
}

function logError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response status:', error.response.status);
    console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received. Request:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error details:', error.message);
  }
}

testPlausibleAPI();
