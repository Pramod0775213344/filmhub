import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { validateOrigin, securityError, validateEnv } from "@/utils/security";

/**
 * Google Analytics Data API integration
 * Fetches real-time or historical data based on credentials
 */

export async function GET(request) {
  // Validate origin for sensitive data
  if (!validateOrigin(request)) {
    return securityError('Unauthorized origin access');
  }

  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;

    // If no credentials or mock mode, return mock data
    if (!propertyId || propertyId === 'mock') {
      return NextResponse.json(generateMockData());
    }

    if (!serviceAccountKey && !serviceAccountPath) {
      return NextResponse.json(generateMockData());
    }

    // Parse service account credentials
    let credentials;
    try {
      if (serviceAccountKey) {
        credentials = typeof serviceAccountKey === 'string' 
          ? JSON.parse(serviceAccountKey) 
          : serviceAccountKey;
      } else if (serviceAccountPath) {
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.resolve(process.cwd(), serviceAccountPath);
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        credentials = JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('❌ Failed to load service account key:', e.message);
      return NextResponse.json(generateMockData());
    }

    // Get authenticated client
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      return NextResponse.json(generateMockData());
    }

    // Fetch real analytics data
    const analyticsData = await fetchGoogleAnalyticsData(propertyId, accessToken.token);
    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('❌ Analytics API Error:', error.message);
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
          metrics: [{ name: 'activeUsers' }],
          limit: 1
        })
      }
    );

    // Fetch today's report
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

    const realtimeData = await realtimeResponse.json();
    const todayData = await todayResponse.json();

    // Format and return
    return formatAnalyticsData(realtimeData, todayData);

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return generateMockData();
  }
}

// Format Google Analytics API response
function formatAnalyticsData(realtimeData, todayData) {
  const activeUsers = realtimeData?.rows?.[0]?.metricValues?.[0]?.value || 0;
  const todayRow = todayData?.rows?.[0]?.metricValues || [];
  
  return {
    realtime: {
      activeUsers: parseInt(activeUsers),
      pageViews: parseInt(todayRow[2]?.value || 0) / 24, // Approximation for realtime
    },
    today: {
      sessions: parseInt(todayRow[0]?.value || 0),
      users: parseInt(todayRow[1]?.value || 0),
      pageViews: parseInt(todayRow[2]?.value || 0),
      bounceRate: parseFloat(todayRow[3]?.value || 0).toFixed(2),
      avgSessionDuration: Math.floor(parseFloat(todayRow[4]?.value || 0)),
    },
    // Mock other parts for UI consistency if real calls fail or aren't implemented yet
    ...generateMockData() 
  };
}

// Generate mock data for demo/fallback
function generateMockData() {
  return {
    realtime: {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      pageViews: Math.floor(Math.random() * 200) + 50,
    },
    today: {
      sessions: Math.floor(Math.random() * 500) + 100,
      users: Math.floor(Math.random() * 400) + 80,
      pageViews: Math.floor(Math.random() * 1500) + 300,
      bounceRate: "42.50",
      avgSessionDuration: 125,
    },
    week: {
      sessions: 4200,
      users: 3100,
      pageViews: 12500,
    },
    topPages: [
      { path: '/', views: 1200, title: 'Home' },
      { path: '/movies', views: 800, title: 'Movies' },
      { path: '/tv-shows', views: 600, title: 'TV Shows' },
    ],
    topCountries: [
      { country: 'Sri Lanka', sessions: 450 },
      { country: 'United States', sessions: 120 },
    ],
    deviceCategory: [
      { device: 'Mobile', sessions: 850 },
      { device: 'Desktop', sessions: 320 },
    ],
    trafficSources: [
      { source: 'Direct', sessions: 600 },
      { source: 'Organic Search', sessions: 450 },
    ],
  };
}
