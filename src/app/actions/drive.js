"use server";

export async function getDriveAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // If credentials are not set up, return null explicitly
  // This allows the frontend to fall back to manual login without error
  if (!clientId || !clientSecret || !refreshToken) {
    console.warn("Google Drive Auto-Login: Missing Environment Variables (GOOGLE_CLIENT_SECRET or GOOGLE_REFRESH_TOKEN).");
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      cache: "no-store"
    });

    const data = await response.json();

    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("Google Drive Refresh Error:", data);
      return null;
    }
  } catch (error) {
    console.error("Google Drive Auth Exception:", error);
    return null;
  }
}
