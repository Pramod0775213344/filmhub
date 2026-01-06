import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@supabase/supabase-js";
import { sendExternalNotification } from "@/app/actions/sendEmail";

const parser = new Parser();

const MONITOR_SITES = [
  { name: "Baiscope.lk", url: "https://www.baiscope.lk/feed/" },
  { name: "Zoom.lk", url: "https://zoom.lk/feed/" },
];

export async function GET(req) {
  // Initialize supabaseAdmin inside the handler
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration in /api/cron/check-updates");
    return new Response('Configuration Error', { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Optional: Check for a secret to prevent unauthorized access if not via Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const results = [];

  for (const site of MONITOR_SITES) {
    try {
      const feed = await parser.parseURL(site.url);
      
      // Get the latest 5 items to avoid overload
      const latestItems = feed.items.slice(0, 5);

      for (const item of latestItems) {
        const guid = item.guid || item.link;

        // Check if already notified
        const { data: existing } = await supabaseAdmin
          .from("external_updates")
          .select("id")
          .eq("guid", guid)
          .single();

        if (!existing) {
          // Send Email
          console.log(`New content found on ${site.name}: ${item.title}`);
          const emailRes = await sendExternalNotification({
            siteName: site.name,
            title: item.title,
            link: item.link
          });

          if (emailRes.success) {
            // Log to database
            await supabaseAdmin.from("external_updates").insert([
              {
                site_name: site.name,
                guid: guid,
                title: item.title,
                link: item.link
              }
            ]);
            results.push({ site: site.name, title: item.title, status: "Notified" });
          } else {
             results.push({ site: site.name, title: item.title, status: "Email Failed", error: emailRes.error });
          }
        } else {
          results.push({ site: site.name, title: item.title, status: "Already Seen" });
        }
      }
    } catch (error) {
      console.error(`Error monitoring ${site.name}:`, error);
      results.push({ site: site.name, status: "Error", error: error.message });
    }
  }

  return NextResponse.json({ success: true, results });
}
