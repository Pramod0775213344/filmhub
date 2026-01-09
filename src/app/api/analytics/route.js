import { NextResponse } from 'next/server';

// Google Analytics Data API integration
// Meka use karanna kalin Google Analytics Data API enable karanna oni
// https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com

export async function GET(request) {
  try {
    // Check if we have the required environment variables
    if (!process.env.GA_PROPERTY_ID) {
      return NextResponse.json(
        { error: 'Google Analytics not configured' },
        { status: 500 }
      );
    }

    // For now, return mock data
    // Real implementation needs Google Analytics Data API credentials
    const mockData = {
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

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
