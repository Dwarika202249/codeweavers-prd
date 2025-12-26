import type { Experience, Stat } from '../types';

export const experiences: Experience[] = [
  {
    id: '1',
    title: 'Software Engineer & Analyst',
    organization: 'HCLTech',
    period: '2022 - Present',
    description: 'Working on enterprise-level frontend applications with React, TypeScript, and modern web technologies.',
    highlights: [
      'Built and maintained React applications with TypeScript and Redux',
      'Collaborated with backend teams on Node.js/Express APIs',
      'Worked with microservices architecture and cloud deployments',
      'Mentored junior developers and conducted code reviews',
    ],
    type: 'industry',
  },
  {
    id: '2',
    title: 'Tech Mentor & Trainer',
    organization: 'Freelance / Personal',
    period: '2020 - Present',
    description: 'Providing practical tech training to college students and aspiring developers.',
    highlights: [
      'Mentored 50+ students in web development',
      'Conducted workshops on MERN stack and frontend technologies',
      'Helped students transition from academics to industry',
      'Created project-based curriculum focused on practical skills',
    ],
    type: 'teaching',
  },
  {
    id: '3',
    title: 'Academic Tutor',
    organization: 'Private Coaching',
    period: '2016 - 2020',
    description: 'Provided academic coaching to school students, building foundational teaching skills.',
    highlights: [
      'Taught mathematics and science to 9th-12th grade students',
      'Developed simplified teaching methods for complex concepts',
      'Conducted home tuitions and local coaching classes',
      'Built strong communication and patience skills',
    ],
    type: 'mentoring',
  },
];

export const stats: Stat[] = [
  {
    label: 'Students Mentored',
    value: '50+',
    icon: 'Users',
  },
  {
    label: 'Years of Experience',
    value: '3+',
    icon: 'Briefcase',
  },
  {
    label: 'Projects Built',
    value: '20+',
    icon: 'FolderCode',
  },
  {
    label: 'Technologies',
    value: '15+',
    icon: 'Code',
  },
];
