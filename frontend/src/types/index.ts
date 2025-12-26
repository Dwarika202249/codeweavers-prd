// Course/Bootcamp types
export interface CurriculumModule {
  week: string;
  title: string;
  topics: string[];
  project?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetAudience: string[];
  learningOutcomes: string[];
  topics: string[];
  prerequisites?: string[];
  featured?: boolean;
  icon?: string;
  curriculum?: CurriculumModule[];
  schedule?: string;
  batchSize?: string;
  mode?: 'Online' | 'Offline' | 'Hybrid';
}

// Testimonial types
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization?: string;
  content: string;
  avatar?: string;
  rating?: number;
}

// Experience/Timeline types
export interface Experience {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  highlights: string[];
  type: 'industry' | 'teaching' | 'mentoring';
}

// Contact form types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  inquiryType: 'student' | 'college' | 'agency' | 'other';
  message: string;
}

// Stats types
export interface Stat {
  label: string;
  value: string | number;
  icon?: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

// Blog types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: string;
  coverImage?: string;
  tags: string[];
}
