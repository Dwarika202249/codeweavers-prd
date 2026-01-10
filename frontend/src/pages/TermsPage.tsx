import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Terms & Conditions" description="CodeWeavers Terms & Conditions" />

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 sm:p-12 text-gray-900 dark:text-gray-100"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Terms & Conditions</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Effective date: Jan 2026 · Please read carefully.</p>
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

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Welcome to CodeWeavers. These Terms describe your rights and responsibilities when using our platform. We focus on providing cohort-based learning and placement-support services tailored to Tier-2/3 cities. If you disagree with these terms, please do not use the service.</p>

        <nav className="mb-6">
          <ul className="flex flex-wrap gap-3 text-sm text-primary-600">
            <li><a className="hover:underline" href="#acceptance">Acceptance</a></li>
            <li><a className="hover:underline" href="#accounts">Accounts</a></li>
            <li><a className="hover:underline" href="#conduct">Content & Conduct</a></li>
            <li><a className="hover:underline" href="#payments">Payments</a></li>
            <li><a className="hover:underline" href="#termination">Termination</a></li>
            <li><a className="hover:underline" href="#liability">Liability</a></li>
            <li><a className="hover:underline" href="#changes">Changes</a></li>
          </ul>
        </nav>

        <section id="acceptance" className="mb-6">
          <h2 className="font-semibold mb-2">1. Acceptance</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">By accessing or using CodeWeavers you agree to these Terms and to comply with all applicable laws. Some features may be subject to additional terms (for example, paid cohorts or third-party integrations).</p>
        </section>

        <section id="accounts" className="mb-6">
          <h2 className="font-semibold mb-2">2. Accounts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">You are responsible for keeping your account credentials secure. You must notify us promptly of any unauthorized use. Accounts are for personal, non-commercial use unless otherwise agreed in writing.</p>
        </section>

        <section id="conduct" className="mb-6">
          <h2 className="font-semibold mb-2">3. Content & Conduct</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">You are responsible for all content you submit. Prohibited content includes anything illegal, infringing, or abusive. We may remove content and suspend accounts that violate these rules.</p>
        </section>

        <section id="payments" className="mb-6">
          <h2 className="font-semibold mb-2">4. Payments & Refunds</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Paid offerings (cohorts, mentorship packages) are subject to the pricing and refund policy published on the relevant page. We reserve the right to change prices; active cohorts are billed per agreement.</p>
        </section>

        <section id="termination" className="mb-6">
          <h2 className="font-semibold mb-2">5. Termination</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">We may suspend or terminate accounts for violations of these Terms. Users may cancel subscriptions according to the billing terms; some refunds may not be available after cohort start dates.</p>
        </section>

        <section id="liability" className="mb-6">
          <h2 className="font-semibold mb-2">6. Limitation of Liability</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">To the fullest extent permitted by law, CodeWeavers is not liable for indirect or consequential losses. Our total liability for direct damages is limited to the fees paid in the prior 12 months.</p>
        </section>

        <section id="changes" className="mb-6">
          <h2 className="font-semibold mb-2">7. Changes to Terms</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">We may update these Terms; material changes will be communicated via email or site notice. Continued use after changes will be considered acceptance.</p>
        </section>

        <section id="contact" className="mb-6">
          <h2 className="font-semibold mb-2">8. Contact Us</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">If you have questions about these Terms, contact us at <a href="mailto:support@codeweavers.example" className="text-primary-600 hover:underline">support@codeweavers.example</a>.</p>
        </section>

        <p className="mt-8 text-xs text-gray-500">Last updated: Jan 2026</p>
      </motion.article>
    </div>
  );
}
