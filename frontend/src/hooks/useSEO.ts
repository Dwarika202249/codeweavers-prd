import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
}

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
};

export function useSEO(props?: SEOProps) {
  const location = useLocation();
  
  useEffect(() => {
    const meta = pageMeta[location.pathname] || defaultMeta;
    const title = props?.title || meta.title;
    const description = props?.description || meta.description;
    
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDescription) ogDescription.setAttribute('content', description);
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    
  }, [location.pathname, props?.title, props?.description]);
}
