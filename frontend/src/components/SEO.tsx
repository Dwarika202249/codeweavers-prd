import { useSEO } from '../hooks/useSEO';

interface SEOProps {
  title?: string;
  description?: string;
}

export default function SEO({ title, description }: SEOProps) {
  useSEO({ title, description });
  return null;
}
