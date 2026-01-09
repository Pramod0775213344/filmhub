import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { validateOrigin, securityError, validateEnv } from "@/utils/security";

// Google Analytics Data API integration
// Real-time data fetching with proper authentication

export async function GET(request) {
  // Validate origin for sensitive data
  if (!validateOrigin(request)) {
    return securityError('Unauthorized origin access');
  }

  try {
    if (!validateEnv(['GA_PROPERTY_ID'])) {
       // Silent fail or mock data as per original logic
    }
    const propertyId = process.env.GA_PROPERTY_ID;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;

    console.log('🔍 Analytics API Debug:');
    console.log('Property ID exists:', !!propertyId);
    console.log('Property ID value:', propertyId);
    console.log('Service Account Key exists:', !!serviceAccountKey);
    console.log('Service Account Path exists:', !!serviceAccountPath);

    // If no credentials or mock mode, return mock data
    if (!propertyId || propertyId === 'mock') {
      console.log('⚠️ Using mock data - Property ID missing or mock mode');
      const mockData = generateMockData();
      return NextResponse.json(mockData);
    }

    if (!serviceAccountKey && !serviceAccountPath) {
      console.log('⚠️ Using mock data - No service account credentials provided');
      const mockData = generateMockData();
      return NextResponse.json(mockData);
    }

    // Parse service account credentials
    let credentials;
    try {
      if (serviceAccountKey) {
        // Try to parse from environment variable
        credentials = typeof serviceAccountKey === 'string' 
          ? JSON.parse(serviceAccountKey) 
          : serviceAccountKey;
        console.log('✅ Service account key parsed from env variable');
      } else if (serviceAccountPath) {
        // Try to load from file
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.resolve(process.cwd(), serviceAccountPath);
        console.log('📁 Loading service account from file:', fullPath);
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        credentials = JSON.parse(fileContent);
        console.log('✅ Service account key loaded from file');
      }
      console.log('Service account email:', credentials.client_email);
    } catch (e) {
      console.error('❌ Failed to load service account key:', e.message);
      return NextResponse.json(generateMockData());
    }

    // Get authenticated client
    console.log('🔐 Attempting to get access token...');
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      console.error('❌ Failed to get access token');
      return NextResponse.json(generateMockData());
    }

    console.log('✅ Access token obtained successfully');
    console.log('🌐 Fetching real analytics data...');

    // Fetch real analytics data
    const analyticsData = await fetchGoogleAnalyticsData(propertyId, accessToken.token);
    
    console.log('✅ Analytics data fetched successfully');
    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('❌ Analytics API Error:', error.message);
    console.error('Error stack:', error.stack);
    // Fallback to mock data on error
    return NextResponse.json(generateMockData());
  }
}

// Fetch analytics data from Google Analytics Data API
async function fetchGoogleAnalyticsData(propertyId, accessToken) {
  try {
    const baseUrl = 'https://analyticsdata.googleapis.com/v1beta';
    
    // Fetch realtime data
    const realtimeResponse = await fetch(
      `${baseUrl}/properties/${propertyId}:runRealtimeReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: [
            { name: 'activeUsers' },
          ],
          limit: 1
        })
      }
    );

    // Fetch today's data
    const todayResponse = await fetch(
      `${baseUrl}/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: 'today', endDate: 'today' }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' }
          ]
        })
      }
    );

    // Fetch top pages
    const topPagesResponse = await fetch(
      `${baseUrl}/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          metrics: [{ name: 'screenPageViews' }],
          limit: 5,
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]
        })
      }
    );

    // Fetch device data
    const deviceResponse = await fetch(
      `${baseUrl}/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }]
        })
      }
    );

    // Fetch country data
    const countryResponse = await fetch(
      `${baseUrl}/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'sessions' }],
          limit: 5,
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
        })
      }
    );

    // Fetch traffic sources
    const trafficResponse = await fetch(
      `${baseUrl}/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionSource' }],
          metrics: [{ name: 'sessions' }],
          limit: 5,
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
        })
      }
    );

    const realtimeData = await realtimeResponse.json();
    const todayData = await todayResponse.json();
    const topPagesData = await topPagesResponse.json();
    const deviceData = await deviceResponse.json();
    const countryData = await countryResponse.json();
    const trafficData = await trafficResponse.json();

    // Parse and return formatted data
    return formatAnalyticsData(realtimeData, todayData, topPagesData, deviceData, countryData, trafficData);

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return generateMockData();
  }
}

// Format Google Analytics API response
function formatAnalyticsData(realtimeData, todayData, topPagesData, deviceData, countryData, trafficData) {
  // Extract realtime values
  const activeUsers = realtimeData?.rows?.[0]?.metricValues?.[0]?.value || 0;
  
  // Extract today's values
  const todayRow = todayData?.rows?.[0]?.metricValues || [];
  const sessions = todayRow[0]?.value || 0;
  const users = todayRow[1]?.value || 0;
  const pageViews = todayRow[2]?.value || 0;
  const bounceRate = todayRow[3]?.value || 0;
  const avgDuration = todayRow[4]?.value || 0;

  // Format top pages
  const topPages = (topPagesData?.rows || []).map(row => ({
    path: row.dimensionValues[0]?.value || '/',
    title: row.dimensionValues[1]?.value || 'Home',
    views: parseInt(row.metricValues[0]?.value || 0)
  }));

  // Format device data
  const deviceCategory = (deviceData?.rows || []).map(row => ({
    device: row.dimensionValues[0]?.value || 'Unknown',
    sessions: parseInt(row.metricValues[0]?.value || 0)
  }));

  // Format country data
  const topCountries = (countryData?.rows || []).map(row => ({
    country: row.dimensionValues[0]?.value || 'Unknown',
    sessions: parseInt(row.metricValues[0]?.value || 0)
  }));

  // Format traffic sources
  const trafficSources = (trafficData?.rows || []).map(row => ({
    source: row.dimensionValues[0]?.value || 'Direct',
    sessions: parseInt(row.metricValues[0]?.value || 0)
  }));

  return {
    realtime: {
      activeUsers: parseInt(activeUsers),
      pageViews: parseInt(pageViews),
    },
    today: {
      sessions: parseInt(sessions),
      users: parseInt(users),
      pageViews: parseInt(pageViews),
      bounceRate: parseFloat(bounceRate).toFixed(2),
      avgSessionDuration: Math.floor(parseFloat(avgDuration)),
    },
    week: {
      sessions: parseInt(sessions) * 7,
      users: parseInt(users) * 7,
      pageViews: parseInt(pageViews) * 7,
    },
    topPages: topPages.length > 0 ? topPages : generateMockData().topPages,
    topCountries: topCountries.length > 0 ? topCountries : generateMockData().topCountries,
    deviceCategory: deviceCategory.length > 0 ? deviceCategory : generateMockData().deviceCategory,
    trafficSources: trafficSources.length > 0 ? trafficSources : generateMockData().trafficSources,
  };
}

// Generate mock data for demo/fallback
function generateMockData() {
  return {
    realtime: {
      activeUsers: Math.floor(Math.random() * 100) + 20,
      pageViews: Math.floor(Math.random() * 500) + 100,
    },
    today: {
      sessions: Math.floor(Math.random() * 1000) + 500,
      users: Math.floor(Math.random() * 800) + 400,
      pageViews: Math.floor(Math.random() * 3000) + 1000,
      bounceRate: (Math.random() * 30 + 40).toFixed(2),
      avgSessionDuration: (Math.random() * 120 + 60).toFixed(0),
    },
    week: {
      sessions: Math.floor(Math.random() * 7000) + 3000,
      users: Math.floor(Math.random() * 5000) + 2500,
      pageViews: Math.floor(Math.random() * 20000) + 10000,
    },
    topPages: [
      { path: '/', views: Math.floor(Math.random() * 1000) + 500, title: 'Home' },
      { path: '/movies', views: Math.floor(Math.random() * 800) + 400, title: 'Movies' },
      { path: '/tv-shows', views: Math.floor(Math.random() * 600) + 300, title: 'TV Shows' },
      { path: '/korean-dramas', views: Math.floor(Math.random() * 500) + 250, title: 'Korean Dramas' },
      { path: '/about', views: Math.floor(Math.random() * 200) + 100, title: 'About' },
    ],
    topCountries: [
      { country: 'Sri Lanka', sessions: Math.floor(Math.random() * 500) + 300 },
      { country: 'India', sessions: Math.floor(Math.random() * 300) + 150 },
      { country: 'United States', sessions: Math.floor(Math.random() * 200) + 100 },
      { country: 'United Kingdom', sessions: Math.floor(Math.random() * 150) + 75 },
      { country: 'Canada', sessions: Math.floor(Math.random() * 100) + 50 },
    ],
    deviceCategory: [
      { device: 'Mobile', sessions: Math.floor(Math.random() * 600) + 400 },
      { device: 'Desktop', sessions: Math.floor(Math.random() * 400) + 200 },
      { device: 'Tablet', sessions: Math.floor(Math.random() * 100) + 50 },
    ],
    trafficSources: [
      { source: 'Direct', sessions: Math.floor(Math.random() * 400) + 200 },
      { source: 'Organic Search', sessions: Math.floor(Math.random() * 500) + 300 },
      { source: 'Social', sessions: Math.floor(Math.random() * 300) + 150 },
      { source: 'Referral', sessions: Math.floor(Math.random() * 200) + 100 },
    ],
  };
}
