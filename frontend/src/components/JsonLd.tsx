import { useEffect } from 'react';
import type { Course } from '../types';

// Base website info
const SITE_URL = 'https://codeweavers.in';
const SITE_NAME = 'CodeWeavers';

// Person schema for the trainer
export const trainerSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Dwarika Kumar',
  jobTitle: 'Software Engineer & Tech Trainer',
  description: 'Industry-experienced software engineer with ~3 years at HCLTech, specializing in frontend development and full-stack applications. Passionate about bridging the gap between academic learning and real-world industry requirements.',
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/dk.png`,
  sameAs: [
    'https://linkedin.com/in/dwarikakumar',
    'https://github.com/dwarikakumar',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'HCLTech',
  },
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'University',
  },
  knowsAbout: [
    'React.js',
    'TypeScript',
    'Node.js',
    'JavaScript',
    'MongoDB',
    'Full Stack Development',
    'Technical Training',
  ],
};

// Organization schema for CodeWeavers
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: SITE_NAME,
  description: 'Tech Training & Bootcamp platform offering industry-aligned courses in MERN Stack, React, Node.js, and more.',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  founder: {
    '@type': 'Person',
    name: 'Dwarika Kumar',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'contact@codeweavers.in',
    availableLanguage: ['English', 'Hindi'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://linkedin.com/company/codeweavers',
    'https://github.com/codeweavers',
  ],
};

// Website schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Tech Training & Bootcamp Showcase Platform - Learn industry-ready skills with practical, project-driven courses.',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/bootcamps?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// Generate Course schema from course data
export function generateCourseSchema(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${SITE_URL}/bootcamps/${course.slug}`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    instructor: {
      '@type': 'Person',
      name: 'Dwarika Kumar',
    },
    courseMode: course.mode || 'Online',
    educationalLevel: course.difficulty,
    timeRequired: course.duration,
    teaches: course.learningOutcomes,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.mode || 'Online',
      instructor: {
        '@type': 'Person',
        name: 'Dwarika Kumar',
      },
    },
    about: course.topics.map(topic => ({
      '@type': 'Thing',
      name: topic,
    })),
  };
}

// Generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

// Generate FAQ schema
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Component to inject JSON-LD into head
interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const schemas = Array.isArray(data) ? data : [data];
    const scriptIds: string[] = [];

    schemas.forEach((schema, index) => {
      const scriptId = `json-ld-${index}-${Date.now()}`;
      scriptIds.push(scriptId);

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      scriptIds.forEach(id => {
        const script = document.getElementById(id);
        if (script) {
          document.head.removeChild(script);
        }
      });
    };
  }, [data]);

  return null;
}

// Pre-built schema components for common pages
export function HomePageSchema() {
  return <JsonLd data={[websiteSchema, organizationSchema]} />;
}

export function AboutPageSchema() {
  return <JsonLd data={[trainerSchema, organizationSchema]} />;
}

export function CoursePageSchema({ course }: { course: Course }) {
  const courseSchema = generateCourseSchema(course);
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Bootcamps', url: '/bootcamps' },
    { name: course.title, url: `/bootcamps/${course.slug}` },
  ]);
  
  return <JsonLd data={[courseSchema, breadcrumbs]} />;
}

export default JsonLd;
