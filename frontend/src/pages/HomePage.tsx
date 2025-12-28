import { Link } from 'react-router-dom';
import { Users, Briefcase, FolderCode, Code, CheckCircle, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section, Container, SectionHeader, Button, StatCard, CourseCard, TestimonialCard } from '../components';
import { HomePageSchema } from '../components/JsonLd';
import { stats } from '../data/experience';
import { testimonials } from '../data/testimonials';
import { useEffect, useState } from 'react';
import { courseAPI } from '../lib/api';
import type { Course as UiCourse } from '../types';

const iconMap: Record<string, LucideIcon> = {
  Users,
  Briefcase,
  FolderCode,
  Code,
};

const whyChooseReasons = [
  {
    title: 'Industry Experience',
    description: 'Learn from someone who works at HCLTech and understands what companies actually need.',
  },
  {
    title: 'Project-Based Learning',
    description: 'Build real applications, not toy examples. Every bootcamp includes portfolio-worthy projects.',
  },
  {
    title: 'Interview Ready',
    description: 'Curriculum designed with hiring expectations in mind. Get job-ready, not just certificate-ready.',
  },
  {
    title: 'Small Batches',
    description: 'Personalized attention and doubt clearing. No getting lost in a crowd of 100+ students.',
  },
];

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<UiCourse[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingFeatured(true);
    (async () => {
      try {
        // pass extra filters via any to keep types simple
        const res = await courseAPI.getAll({ page: 1, limit: 6, featured: true } as any);
        if (!mounted) return;
        const courses: UiCourse[] = (res.data.data.courses || []).map((c: any) => ({
          id: c._id || c.id,
          title: c.title,
          slug: c.slug,
          description: c.description || c.shortDescription || '',
          duration: c.duration || '',
          difficulty: (c.level || c.difficulty || 'Beginner') as UiCourse['difficulty'],
          targetAudience: c.targetAudience || [],
          learningOutcomes: c.learningOutcomes || [],
          topics: c.topics || c.learningOutcomes || [],
          prerequisites: c.prerequisites || [],
          featured: Boolean(c.featured),
          icon: c.icon,
          curriculum: c.curriculum || [],
          schedule: c.schedule || '',
          batchSize: c.batchSize || '',
          mode: c.mode || undefined,
        }));
        setFeaturedCourses(courses);
      } catch (err) {
        if (!mounted) return;
        setFeaturedCourses([]);
      } finally {
        if (mounted) setLoadingFeatured(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <HomePageSchema />
      <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-linear-to-br from-gray-900 via-gray-950 to-indigo-950">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <Container className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400">
              🚀 Industry-Experienced Tech Trainer
            </span>
            
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Learn Skills That
              <span className="block bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Companies Actually Use
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl">
              Bridging the gap between academic learning and real-world development. 
              Practical, project-driven bootcamps designed by an industry professional.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/bootcamps">
                <Button size="lg" className="group">
                  View Bootcamps
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact for College Training
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                HCLTech Experience
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                50+ Students Mentored
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Real Project Experience
              </span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-800 bg-gray-900 py-12">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => {
              const IconComponent = stat.icon ? iconMap[stat.icon] : undefined;
              return (
                <StatCard
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  icon={IconComponent}
                />
              );
            })}
          </div>
        </Container>
      </section>

      {/* Why Choose Section */}
      <Section background="default">
        <Container>
          <SectionHeader
            title="Why Learn With Me?"
            subtitle="What makes this training different from typical college courses or generic online tutorials"
          />
          
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseReasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-indigo-500/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/20 text-2xl">
                  {index === 0 && '💼'}
                  {index === 1 && '🔨'}
                  {index === 2 && '🎯'}
                  {index === 3 && '👥'}
                </div>
                <h3 className="text-lg font-semibold text-white">{reason.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured Bootcamps */}
      <Section background="dark">
        <Container>
          <SectionHeader
            title="Featured Bootcamps"
            subtitle="Hands-on, project-driven courses designed for real-world success"
          />
          
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingFeatured ? (
              <div className="col-span-3 text-center text-gray-400">Loading featured bootcamps...</div>
            ) : (featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))) }
          </div>

          <div className="mt-12 text-center">
            <Link to="/bootcamps">
              <Button variant="outline" size="lg">
                View All Bootcamps
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section>
        <Container>
          <SectionHeader
            title="What Students Say"
            subtitle="Hear from professionals who transformed their careers through my bootcamps"
          />
          
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/experience">
              <Button variant="outline" size="lg">
                View All Testimonials
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background="gradient">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Build Real Skills?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
              Whether you're a student looking to upskill, or an institution seeking quality training, 
              let's discuss how we can work together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <Button size="lg">
                  Get in Touch
                </Button>
              </Link>
              <Link to="/methodology">
                <Button variant="ghost" size="lg">
                  Learn About My Approach
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
    </>
  );
}
