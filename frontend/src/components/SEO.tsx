import { useSEO } from '../hooks/useSEO';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  noindex?: boolean;
}

export default function SEO({ 
  title, 
  description, 
  image, 
  type, 
  publishedTime, 
  author,
  noindex 
}: SEOProps) {
  useSEO({ title, description, image, type, publishedTime, author, noindex });
  return null;
}
