import type { BlogPost } from '../types';

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Why Concept→Build→Debug is the Only Way to Learn Programming',
    slug: 'concept-build-debug-methodology',
    excerpt: 'Forget passive video tutorials. The fastest path to coding mastery is through understanding concepts, building real projects, and debugging your way to enlightenment.',
    content: '',
    author: 'Dwarika Kumar',
    publishedAt: '2025-01-15',
    readTime: '8 min read',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    tags: ['Learning', 'Methodology', 'Career'],
  },
  {
    id: '2',
    title: 'Java vs JavaScript: Which Should You Learn First?',
    slug: 'java-vs-javascript-beginners',
    excerpt: 'A practical comparison for beginners trying to choose their first programming language. Spoiler: the answer depends on your goals.',
    content: '',
    author: 'Dwarika Kumar',
    publishedAt: '2025-01-10',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    tags: ['Java', 'JavaScript', 'Beginners'],
  },
  {
    id: '3',
    title: 'Building Your First REST API: A Complete Guide',
    slug: 'building-first-rest-api',
    excerpt: 'Step-by-step tutorial on creating a production-ready REST API using Spring Boot. From project setup to deployment.',
    content: '',
    author: 'Dwarika Kumar',
    publishedAt: '2025-01-05',
    readTime: '12 min read',
    coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
    tags: ['Spring Boot', 'REST API', 'Java', 'Tutorial'],
  },
  {
    id: '4',
    title: 'React Hooks Explained: useState, useEffect, and Beyond',
    slug: 'react-hooks-explained',
    excerpt: 'A comprehensive guide to React Hooks for developers transitioning from class components or just starting out.',
    content: '',
    author: 'Dwarika Kumar',
    publishedAt: '2024-12-28',
    readTime: '10 min read',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    tags: ['React', 'JavaScript', 'Frontend'],
  },
  {
    id: '5',
    title: 'How I Prepared Students for HCL and Cognizant Interviews',
    slug: 'hcl-cognizant-interview-prep',
    excerpt: 'Inside look at the interview preparation strategies that helped my students land jobs at top IT companies.',
    content: '',
    author: 'Dwarika Kumar',
    publishedAt: '2024-12-20',
    readTime: '7 min read',
    coverImage: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800',
    tags: ['Career', 'Interviews', 'Job Prep'],
  },
  {
    id: '6',
    title: 'Database Design Principles Every Developer Should Know',
    slug: 'database-design-principles',
    excerpt: 'From normalization to indexing, learn the fundamentals of designing efficient and scalable databases.',
    content: '',
    author: 'Dwarika Kumar',
    publishedAt: '2024-12-15',
    readTime: '9 min read',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    tags: ['Database', 'SQL', 'Backend'],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getRecentPosts(count: number = 3): BlogPost[] {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => 
    post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  blogPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
