import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '../lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  inquiryType: z.enum(['student', 'college', 'agency', 'other'], {
    message: 'Please select an inquiry type',
  }),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const inquiryTypes = [
  { value: 'student', label: 'Student / Individual Learner' },
  { value: 'college', label: 'College / University' },
  { value: 'agency', label: 'Training Agency' },
  { value: 'other', label: 'Other Inquiry' },
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Form submitted:', data);
    toast.success('Message sent successfully! I\'ll get back to you soon.');
    reset();
  };

  return (
    <div className="min-h-screen py-20">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Get in Touch</h1>
          <p className="mt-4 text-lg text-gray-400">
            Interested in training, collaboration, or have questions? Let's talk!
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white">Contact Information</h2>
              <p className="mt-2 text-gray-400">
                Fill out the form and I'll get back to you within 24-48 hours.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-5 w-5 text-indigo-400" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <p className="text-gray-400">contact@codeweavers.in</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-5 w-5 text-indigo-400" />
                <div>
                  <p className="font-medium text-white">Phone</p>
                  <p className="text-gray-400">+91 98XXX XXXXX</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 text-indigo-400" />
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p className="text-gray-400">India (Remote Available)</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h3 className="font-semibold text-white">Available For</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li>• College / University Training Programs</li>
                <li>• Corporate Bootcamps</li>
                <li>• 1-on-1 Mentorship</li>
                <li>• Workshop Facilitation</li>
                <li>• Curriculum Development</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-xl border border-gray-800 bg-gray-900 p-8"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={cn(
                      'mt-1 w-full rounded-lg border bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-500',
                      'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                      errors.name ? 'border-red-500' : 'border-gray-700'
                    )}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={cn(
                      'mt-1 w-full rounded-lg border bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-500',
                      'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                      errors.email ? 'border-red-500' : 'border-gray-700'
                    )}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-200">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-200">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    {...register('organization')}
                    className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="College / Company name"
                  />
                </div>
              </div>

              {/* Inquiry Type */}
              <div className="mt-6">
                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-200">
                  I am a... *
                </label>
                <select
                  id="inquiryType"
                  {...register('inquiryType')}
                  className={cn(
                    'mt-1 w-full rounded-lg border bg-gray-800 px-4 py-2 text-gray-200',
                    'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                    errors.inquiryType ? 'border-red-500' : 'border-gray-700'
                  )}
                >
                  <option value="">Select an option</option>
                  {inquiryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.inquiryType && (
                  <p className="mt-1 text-sm text-red-400">{errors.inquiryType.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="mt-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-200">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register('message')}
                  className={cn(
                    'mt-1 w-full rounded-lg border bg-gray-800 px-4 py-2 text-gray-200 placeholder-gray-500',
                    'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                    errors.message ? 'border-red-500' : 'border-gray-700'
                  )}
                  placeholder="Tell me about your training needs, questions, or how I can help..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
