import { Link } from 'react-router-dom';
import { Download, Briefcase, GraduationCap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Section, Container, SectionHeader, Button, SkillTag, TimelineItem } from '../components';
import { experiences } from '../data/experience';
import profileImage from '../assets/dk.png';

const skills = {
  frontend: ['React.js', 'TypeScript', 'JavaScript', 'Redux', 'Tailwind CSS', 'HTML/CSS'],
  backend: ['Node.js', 'Express.js', 'REST APIs', 'MongoDB', 'MySQL'],
  tools: ['Git', 'VS Code', 'Postman', 'AWS Basics', 'Azure Basics'],
};

const highlights = [
  { icon: Briefcase, label: 'Industry Experience', value: '~3 Years at HCLTech' },
  { icon: GraduationCap, label: 'Students Mentored', value: '50+ Developers' },
  { icon: Heart, label: 'Teaching Experience', value: 'School to Industry' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <Section background="gradient">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative">
                <div className="h-64 w-64 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm sm:h-80 sm:w-80">
                  <img 
                    src={profileImage} 
                    alt="Dwarika Kumar - Tech Trainer & Software Engineer"
                    className="h-full w-full rounded-xl object-cover ring-1 ring-white/10"
                  />
                </div>
                {/* Glow effect behind image */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-indigo-500/20 blur-2xl" />
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-xl border border-indigo-500/30 bg-gray-900/80 p-4 backdrop-blur">
                  <p className="text-2xl font-bold text-indigo-400">3+</p>
                  <p className="text-xs text-gray-400">Years Exp</p>
                </div>
              </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl font-bold text-white sm:text-5xl">Dwarika Kumar</h1>
              <p className="mt-2 text-xl text-indigo-400">
                Software Engineer | Tech Trainer | Full-Stack Mentor
              </p>
              
              <p className="mt-6 text-lg text-gray-300">
                Industry-experienced software engineer with ~3 years at HCLTech, specializing in 
                frontend development and full-stack applications. Passionate about bridging the gap 
                between academic learning and real-world industry requirements.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <a 
                  href="/Dwarika_Kumar_Resume.txt" 
                  download="Dwarika_Kumar_Resume.txt"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  <Download className="h-5 w-5" />
                  Download CV
                </a>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Quick Highlights */}
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {highlights.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600/20">
                  <item.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="font-semibold text-white">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Industry Experience */}
      <Section>
        <Container>
          <SectionHeader
            title="Industry Experience"
            subtitle="Real-world experience that informs every lesson I teach"
          />
          
          <div className="mt-12 rounded-xl border border-gray-800 bg-gray-900 p-8">
            <h3 className="text-xl font-semibold text-white">Software Engineer & Analyst @ HCLTech</h3>
            <p className="mt-1 text-indigo-400">2022 - Present</p>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-gray-300">
                  <span className="mr-2 text-indigo-400">→</span>
                  Frontend-heavy applications with React, TypeScript, Redux
                </p>
                <p className="text-gray-300">
                  <span className="mr-2 text-indigo-400">→</span>
                  Backend collaboration using Node.js, Express, REST APIs
                </p>
                <p className="text-gray-300">
                  <span className="mr-2 text-indigo-400">→</span>
                  Microservices-based architecture exposure
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-gray-300">
                  <span className="mr-2 text-indigo-400">→</span>
                  MongoDB and MySQL database experience
                </p>
                <p className="text-gray-300">
                  <span className="mr-2 text-indigo-400">→</span>
                  Real-world debugging and production issues
                </p>
                <p className="text-gray-300">
                  <span className="mr-2 text-indigo-400">→</span>
                  Cloud fundamentals (AWS/Azure)
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Teaching Philosophy */}
      <Section background="dark">
        <Container>
          <SectionHeader
            title="Teaching Philosophy"
            subtitle="What drives my approach to tech education"
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4 text-4xl">🎯</div>
              <h3 className="text-lg font-semibold text-white">Practical Over Theoretical</h3>
              <p className="mt-2 text-gray-400">
                Every concept is taught through building real projects. Theory is minimal but foundational—just enough to understand the "why" before diving into the "how."
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4 text-4xl">💼</div>
              <h3 className="text-lg font-semibold text-white">Industry-Aligned Skills</h3>
              <p className="mt-2 text-gray-400">
                Curriculum designed based on what companies actually hire for. No outdated technologies or irrelevant topics—only what gets you job-ready.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-4 text-4xl">🤝</div>
              <h3 className="text-lg font-semibold text-white">Confidence Building</h3>
              <p className="mt-2 text-gray-400">
                Beyond coding skills, I focus on building confidence to tackle interviews, work in teams, and approach problems like a professional developer.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Technical Skills */}
      <Section>
        <Container>
          <SectionHeader
            title="Technical Skills"
            subtitle="Technologies I work with and teach"
          />

          <div className="mt-12 space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-indigo-400">Frontend</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {skills.frontend.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-indigo-400">Backend</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {skills.backend.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-indigo-400">Tools & Cloud</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {skills.tools.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Career Timeline */}
      <Section background="dark">
        <Container>
          <SectionHeader
            title="Career Journey"
            subtitle="From teaching school students to training future developers"
          />

          <div className="mt-12 space-y-6">
            {experiences.map((exp, index) => (
              <TimelineItem
                key={exp.id}
                experience={exp}
                isLast={index === experiences.length - 1}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section background="gradient">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Want to Learn From Industry Experience?</h2>
            <p className="mt-4 text-lg text-gray-300">
              Check out the bootcamps or reach out to discuss custom training programs.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/bootcamps">
                <Button size="lg">View Bootcamps</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">Contact Me</Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
