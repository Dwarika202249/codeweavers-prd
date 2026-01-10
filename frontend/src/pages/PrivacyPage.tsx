import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Privacy Policy" description="CodeWeavers Privacy Policy" />

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 sm:p-12 text-gray-900 dark:text-gray-100"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Effective date: Jan 2026 · Your privacy matters.</p>
          </div>
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-primary-600 hover:underline"
              aria-label="Go back"
            >
              ← Back
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">We collect and use personal data to operate the platform, provide learning services, and improve outcomes for learners. Below is a detailed overview of what we collect, why we collect it, and your rights regarding your data.</p>

        <nav className="mb-6">
          <ul className="flex flex-wrap gap-3 text-sm text-primary-600">
            <li><a className="hover:underline" href="#data">Data We Collect</a></li>
            <li><a className="hover:underline" href="#use">How We Use Data</a></li>
            <li><a className="hover:underline" href="#third">Third-party Services</a></li>
            <li><a className="hover:underline" href="#security">Security</a></li>
            <li><a className="hover:underline" href="#rights">Your Rights</a></li>
          </ul>
        </nav>

        <section id="data" className="mb-6">
          <h2 className="font-semibold mb-2">1. Data We Collect</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">We collect account information (name, email), profile data, cohort/application details, payment and billing information for paid offerings, and usage analytics (course progress, performance metrics) to help mentors and students track progress.</p>
        </section>

        <section id="use" className="mb-6">
          <h2 className="font-semibold mb-2">2. How We Use Data</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Data is used to operate the service, communicate important updates, provide personalized learning recommendations, and for aggregated analytics to improve the platform. We do not sell personal data to third parties.</p>
        </section>

        <section id="third" className="mb-6">
          <h2 className="font-semibold mb-2">3. Third-party Services</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">We use trusted service providers (payment processors, analytics providers, email services). These providers act as data processors under our instructions and are required to protect your data.</p>
        </section>

        <section id="security" className="mb-6">
          <h2 className="font-semibold mb-2">4. Security</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">We maintain industry-standard security practices to protect user data, including encryption at rest and in transit. However, no system is 100% secure — contact support if you suspect a breach.</p>
        </section>

        <section id="rights" className="mb-6">
          <h2 className="font-semibold mb-2">5. Your Rights</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">You can request access to, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:support@codeweavers.example" className="text-primary-600 hover:underline">support@codeweavers.example</a>. We will respond within a reasonable timeframe as required by applicable law.</p>
        </section>

        <p className="mt-8 text-xs text-gray-500">Last updated: Jan 2026</p>
      </motion.article>
    </div>
  );
}
