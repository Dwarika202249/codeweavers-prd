import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://codeweavers.in';
const DEFAULT_IMAGE = '/og-image.png';

const defaultMeta = {
  title: 'CodeWeavers | Tech Training & Bootcamps',
  description: 'Industry-experienced tech trainer offering practical, project-driven bootcamps in MERN Stack, React+TypeScript, Node.js, and more.',
};

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'CodeWeavers | Tech Training & Bootcamps by Dwarika Kumar',
    description: 'Industry-experienced tech trainer offering practical, project-driven bootcamps. Bridging the gap between academic learning and real-world development.',
  },
  '/about': {
    title: 'About Dwarika Kumar | CodeWeavers',
    description: 'Software Engineer at HCLTech turned tech trainer. ~3 years of industry experience in React, TypeScript, Node.js. Mentored 50+ students.',
  },
  '/bootcamps': {
    title: 'Bootcamps & Courses | CodeWeavers',
    description: 'Explore practical, industry-focused bootcamps in MERN Stack, React+TypeScript, Node.js, Cloud Basics, and Interview Preparation.',
  },
  '/methodology': {
    title: 'Teaching Methodology | CodeWeavers',
    description: 'Learn about the Concept → Build → Debug approach. Practical learning over theory, designed for real jobs, not just exams.',
  },
  '/experience': {
    title: 'Experience & Testimonials | CodeWeavers',
    description: 'See the career journey and read what students say about the training. Industry experience meets passion for teaching.',
  },
  '/contact': {
    title: 'Contact | CodeWeavers',
    description: 'Get in touch for college training, corporate bootcamps, or individual mentorship. Available for workshops and custom programs.',
  },
  '/blog': {
    title: 'Blog & Insights | CodeWeavers',
    description: 'Thoughts on programming, learning strategies, career development, and the tech industry from trainer Dwarika Kumar.',
  },
};

export function useSEO(props?: SEOProps) {
  const location = useLocation();
  
  useEffect(() => {
    const meta = pageMeta[location.pathname] || defaultMeta;
    const title = props?.title || meta.title;
    const description = props?.description || meta.description;
    const image = props?.image || DEFAULT_IMAGE;
    const type = props?.type || 'website';
    const url = `${BASE_URL}${location.pathname}`;
    
    // Update document title
    document.title = title;
    
    // Helper to update or create meta tags
    const setMetaTag = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, value);
      }
    };
    
    // Update meta description
    setMetaTag('meta[name="description"]', 'content', description);
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', url);
    
    // Update robots if noindex
    if (props?.noindex) {
      setMetaTag('meta[name="robots"]', 'content', 'noindex, nofollow');
    } else {
      setMetaTag('meta[name="robots"]', 'content', 'index, follow');
    }
    
    // Update Open Graph tags
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:url"]', 'content', url);
    setMetaTag('meta[property="og:type"]', 'content', type);
    setMetaTag('meta[property="og:image"]', 'content', image.startsWith('http') ? image : `${BASE_URL}${image}`);
    
    // Update Twitter tags
    setMetaTag('meta[property="twitter:title"]', 'content', title);
    setMetaTag('meta[property="twitter:description"]', 'content', description);
    setMetaTag('meta[property="twitter:url"]', 'content', url);
    setMetaTag('meta[property="twitter:image"]', 'content', image.startsWith('http') ? image : `${BASE_URL}${image}`);
    
    // Article-specific tags
    if (type === 'article' && props?.publishedTime) {
      let articleTime = document.querySelector('meta[property="article:published_time"]');
      if (!articleTime) {
        articleTime = document.createElement('meta');
        articleTime.setAttribute('property', 'article:published_time');
        document.head.appendChild(articleTime);
      }
      articleTime.setAttribute('content', props.publishedTime);
      
      if (props?.author) {
        let articleAuthor = document.querySelector('meta[property="article:author"]');
        if (!articleAuthor) {
          articleAuthor = document.createElement('meta');
          articleAuthor.setAttribute('property', 'article:author');
          document.head.appendChild(articleAuthor);
        }
        articleAuthor.setAttribute('content', props.author);
      }
    }
    
  }, [location.pathname, props?.title, props?.description, props?.image, props?.type, props?.publishedTime, props?.author, props?.noindex]);
}
