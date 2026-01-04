export default function robots() {
  // baseUrl must match what is used in sitemap.js
  const baseUrl = "https://filmhub-three.vercel.app"; 
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/profile/", "/my-list/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
