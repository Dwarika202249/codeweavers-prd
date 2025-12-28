import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const methodologySteps = [
  {
    step: 1,
    title: 'Concept',
    description: 'Understand the "why" behind every technology. Theory is minimal but foundational.',
    icon: '💡',
  },
  {
    step: 2,
    title: 'Build',
    description: 'Learn by building real projects. No toy examples—actual production-like applications.',
    icon: '🔨',
  },
  {
    step: 3,
    title: 'Debug',
    description: 'Break things, fix them, and understand how real-world debugging works in the industries.',
    icon: '🔍',
  },
];

const differentiators = [
  'Industry experience from HCLTech informs every lesson',
  'Projects that mirror actual company workflows',
  'Interview preparation woven into curriculum',
  'Real code reviews and feedback sessions',
  'Focus on skills companies are actually hiring for',
  'Small batches for personalized attention',
];

const traditionalVsPractical = [
  { traditional: 'Theory-heavy lectures', practical: 'Hands-on coding from day 1' },
  { traditional: 'Outdated curriculum', practical: 'Current industry technologies' },
  { traditional: 'No real-world context', practical: 'Projects based on actual company work' },
  { traditional: 'Exam-focused learning', practical: 'Interview and job-focused training' },
  { traditional: 'Generic assignments', practical: 'Portfolio-worthy projects' },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Teaching Methodology</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            A practical approach to learning that prepares you for real jobs, not just exams.
          </p>
        </div>

        {/* Concept → Build → Debug */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-white">The Learning Framework</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {methodologySteps.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
                  <div className="text-5xl">{item.icon}</div>
                  <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-gray-400">{item.description}</p>
                </div>
                {index < methodologySteps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 text-indigo-500 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* What Makes This Different */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-white">What Makes This Different?</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traditional vs Practical */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-white">Traditional vs Practical Learning</h2>
          <div className="mt-12 overflow-hidden rounded-xl border border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-red-400">
                    Traditional College Approach
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-green-400">
                    My Practical Approach
                  </th>
                </tr>
              </thead>
              <tbody>
                {traditionalVsPractical.map((row, index) => (
                  <tr key={index} className="border-b border-gray-800 last:border-0">
                    <td className="px-6 py-4 text-gray-400">{row.traditional}</td>
                    <td className="px-6 py-4 text-gray-200">{row.practical}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h3 className="text-2xl font-bold text-white">Ready to Learn the Right Way?</h3>
          <p className="mt-2 text-gray-400">Explore our bootcamps and start your journey today.</p>
          <Link
            to="/bootcamps"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            View Bootcamps
          </Link>
        </div>
      </div>
    </div>
  );
}
