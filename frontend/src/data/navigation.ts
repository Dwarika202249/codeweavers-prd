import type { NavItem } from '../types';

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Bootcamps', href: '/bootcamps' },
  { label: 'Methodology', href: '/methodology' },
  { label: 'Experience', href: '/experience' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export const footerLinks = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Bootcamps', href: '/bootcamps' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  courses: [
    { label: 'MERN Stack', href: '/bootcamps/mern-stack-development' },
    { label: 'React + TypeScript', href: '/bootcamps/react-typescript-mastery' },
    { label: 'Node.js Backend', href: '/bootcamps/nodejs-express-backend' },
    { label: 'Interview Prep', href: '/bootcamps/interview-preparation' },
  ],
  social: [
    { label: 'LinkedIn', href: 'https://linkedin.com', isExternal: true },
    { label: 'GitHub', href: 'https://github.com', isExternal: true },
    { label: 'Twitter', href: 'https://twitter.com', isExternal: true },
  ],
};
