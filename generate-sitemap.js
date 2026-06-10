// generate-sitemap.js
import fs from "fs";
import path from "path";

const siteUrl = "https://www.oliveextra.com";
const apiUrl = "https://back.oliveextra.com/api/blog/";
const apiUrlP = "https://back.oliveextra.com/api/product/";

// Helper function to create clean SEO slugs
const createSlug = (item) => {
  const baseString = item.slug || item.title || "";
  return baseString
    .toLowerCase()
    .replace(/\s+/g, "-")          // Replace spaces with -
    .replace(/[^\w\-]+/g, "")      // Remove all non-word chars
    .replace(/\-\-+/g, "-")        // Replace multiple - with single -
    .replace(/^-+/, "")            // Trim - from start of text
    .replace(/-+$/, "");           // Trim - from end of text
};

const generateSitemap = async () => {
  try {
    console.log("🚀 Fetching data from APIs...");

    // Using native fetch available in Node.js 22+
    const [blogResponse, productResponse] = await Promise.all([
      fetch(apiUrl),
      fetch(apiUrlP)
    ]);

    const blogsData = await blogResponse.json();
    const productsData = await productResponse.json();

    // Ensure we are working with arrays to prevent crashes
    const blogs = Array.isArray(blogsData) ? blogsData : (blogsData.data || []);
    const products = Array.isArray(productsData) ? productsData : (productsData.data || []);

    const staticPages = [
      "", // Home
      "about-us",
      "contact",
      "blog",
      "product",
      "terms-of-service",
      "privacy-policy",
    ];

    const blogPages = blogs.map((blog) => `blog/${createSlug(blog)}`);
    const productPages = products.map((product) => `product/${createSlug(product)}`);
    
    const allPages = [...staticPages, ...blogPages, ...productPages];

    const today = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map((page) => {
    // Set priority: Home gets 1.0, Static gets 0.8, Dynamic gets 0.7
    const priority = page === "" ? "1.0" : (staticPages.includes(page) ? "0.8" : "0.7");
    // Ensure URL doesn't have double slashes if page is empty
    const fullUrl = page === "" ? siteUrl : `${siteUrl}/${page}`;
    
    return `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    const filePath = path.join(process.cwd(), "public", "sitemap.xml");
    fs.writeFileSync(filePath, sitemap, "utf8");

    console.log(`✅ Sitemap generated successfully with ${allPages.length} URLs at:`, filePath);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
  }
};

generateSitemap();