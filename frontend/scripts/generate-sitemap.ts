/**
 * Sitemap Generator Script
 * 
 * Run this script to regenerate the sitemap.xml based on current routes and content.
 * Usage: npx tsx scripts/generate-sitemap.ts
 * 
 * This script reads the courses and blog posts data and generates a complete sitemap.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Site configuration
const SITE_URL = 'https://codeweavers.in';
const TODAY = new Date().toISOString().split('T')[0];

// Static routes with their priorities and change frequencies
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/courses', priority: 0.9, changefreq: 'weekly' },
  { path: '/testimonials', priority: 0.7, changefreq: 'monthly' },
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
];

// Course slugs (update this when adding new courses)
const courseSlugs = [
  'mern-stack-development',
  'react-js-masterclass',
  'javascript-fundamentals',
  'java-spring-boot',
  'rest-api-design',
  'git-version-control',
];

// Blog post slugs with their publish dates (update this when adding new posts)
const blogPosts = [
  { slug: 'concept-build-debug-methodology', date: '2025-01-15' },
  { slug: 'java-vs-javascript-beginners', date: '2025-01-10' },
  { slug: 'building-first-rest-api', date: '2025-01-05' },
  { slug: 'college-to-industry-transition', date: '2024-12-28' },
  { slug: 'react-state-management-2024', date: '2024-12-20' },
  { slug: 'debugging-tips-developers', date: '2024-12-15' },
];

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

function generateUrlEntry(entry: SitemapEntry): string {
  return `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
}

function generateSitemap(): string {
  const entries: SitemapEntry[] = [];

  // Add static routes
  for (const route of staticRoutes) {
    entries.push({
      loc: `${SITE_URL}${route.path}`,
      lastmod: TODAY,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }

  // Add course detail pages
  for (const slug of courseSlugs) {
    entries.push({
      loc: `${SITE_URL}/courses/${slug}`,
      lastmod: TODAY,
      changefreq: 'monthly',
      priority: 0.8,
    });
  }

  // Add blog posts
  for (const post of blogPosts) {
    entries.push({
      loc: `${SITE_URL}/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: 'yearly',
      priority: 0.6,
    });
  }

  const urlEntries = entries.map(generateUrlEntry).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = resolve(__dirname, '../public/sitemap.xml');

writeFileSync(outputPath, sitemap, 'utf-8');

console.log('✅ Sitemap generated successfully!');
console.log(`📍 Output: ${outputPath}`);
console.log(`📊 Total URLs: ${staticRoutes.length + courseSlugs.length + blogPosts.length}`);
