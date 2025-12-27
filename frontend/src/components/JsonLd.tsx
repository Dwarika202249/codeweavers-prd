import { useEffect } from 'react';

import {
  trainerSchema,
  organizationSchema,
  websiteSchema,
  generateCourseSchema,
  generateBreadcrumbSchema,
} from '../lib/schemas';

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

export function CoursePageSchema({ course }: { course: any }) {
  const courseSchema = generateCourseSchema(course);
  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Bootcamps', url: '/bootcamps' },
    { name: course.title, url: `/bootcamps/${course.slug}` },
  ]);
  
  return <JsonLd data={[courseSchema, breadcrumbs]} />;
}

export default JsonLd;
