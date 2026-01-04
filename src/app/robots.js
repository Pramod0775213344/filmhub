export default function robots() {
  const baseUrl = "https://filmhub-movie.vercel.app"; // Replace with your actual domain
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/profile/", "/my-list/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
