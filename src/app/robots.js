export default function robots() {
  // මෙතැන ඇති baseUrl එක sitemap.js හි ඇති baseUrl එකටම සමාන විය යුතුය.
  const baseUrl = "https://filmhub-movie.vercel.app"; 
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/profile/", "/my-list/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
