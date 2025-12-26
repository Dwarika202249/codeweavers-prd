import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { CheckCircle, X, Mail, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { EmailData } from '../../lib/emailService';
import { showSuccess } from '../../lib/toastUtils';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  emails: EmailData[];
  userName: string;
}

export default function EmailConfirmationModal({
  isOpen,
  onClose,
  referenceId,
  emails,
  userName,
}: EmailConfirmationModalProps) {
  const autoReply = emails.find((e) => e.to !== 'contact@codeweavers.in');

  const copyReferenceId = () => {
    navigator.clipboard.writeText(referenceId);
    showSuccess('Reference ID copied to clipboard!');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                {/* Close button */}
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
                >
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </motion.div>

                <DialogTitle
                  as="h3"
                  className="mt-4 text-center text-xl font-semibold text-white"
                >
                  Message Sent Successfully!
                </DialogTitle>

                <p className="mt-2 text-center text-gray-400">
                  Thank you, {userName}! Your message has been received.
                </p>

                {/* Reference ID */}
                <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Reference ID</p>
                      <p className="font-mono text-lg font-semibold text-indigo-400">
                        {referenceId}
                      </p>
                    </div>
                    <button
                      onClick={copyReferenceId}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
                      aria-label="Copy reference ID"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Email notification */}
                {autoReply && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Mail className="h-4 w-4 text-green-400" />
                    <span>A confirmation email has been sent to <strong className="text-gray-300">{autoReply.to}</strong></span>
                  </div>
                )}

                <p className="mt-4 text-center text-sm text-gray-500">
                  We'll get back to you within 24-48 hours.
                </p>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                >
                  Got it, thanks!
                </button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
