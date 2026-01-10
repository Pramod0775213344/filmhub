"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMovieNotification({ title, year, category, typeLabel }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return { success: false, error: "API Key missing" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'SubHub SL <onboarding@resend.dev>',
      to: ['pramodravishanka3344@gmail.com'],
      subject: `🎬 New ${typeLabel} Added: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #0c0c0c; color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #e50914; margin: 0; font-size: 28px;">SUBHUB SL</h1>
            <p style="color: #888; margin: 5px 0 0 0;">New Content Notification</p>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 25px; border-radius: 12px; border: 1px solid #333; margin-bottom: 20px;">
            <p style="margin-top: 0; color: #e50914; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Recently Added</p>
            <h2 style="margin: 10px 0; font-size: 24px;">${title}</h2>
            <p style="margin: 5px 0; color: #ccc;"><strong>Year:</strong> ${year}</p>
            <p style="margin: 5px 0; color: #ccc;"><strong>Category:</strong> ${category}</p>
            <p style="margin: 5px 0; color: #ccc;"><strong>Type:</strong> ${typeLabel}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://filmhub-three.vercel.app/" style="display: inline-block; background-color: #e50914; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View on Website</a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
            <p style="font-size: 12px; color: #555;">
              This is an automated notification from your SubHub SL website.
              <br>© 2026 SubHub SL Admin System
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Notification action error:", err);
    return { success: false, error: err.message };
  }
}

export async function sendExternalNotification({ siteName, title, link }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return { success: false, error: "API Key missing" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'SubHub SL <onboarding@resend.dev>',
      to: ['pramodravishanka3344@gmail.com'],
      subject: `🔔 New on ${siteName}: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #0c0c0c; color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #e50914; margin: 0; font-size: 28px;">SUBHUB SL MONITOR</h1>
            <p style="color: #888; margin: 5px 0 0 0;">External Site Update Detected</p>
          </div>
          
          <div style="background-color: #1a1a1a; padding: 25px; border-radius: 12px; border: 1px solid #333; margin-bottom: 20px;">
            <p style="margin-top: 0; color: #e50914; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Source: ${siteName}</p>
            <h2 style="margin: 10px 0; font-size: 18px;">${title}</h2>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${link}" style="display: inline-block; background-color: #e50914; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View on ${siteName}</a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
            <p style="font-size: 12px; color: #555;">
              This is an automated monitor for Baiscope, Zoom, and Cineru.
              <br>© 2026 SubHub SL Monitoring Service
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("External notification action error:", err);
    return { success: false, error: err.message };
  }
}

