// Mock email service for demonstration purposes
// In production, this would integrate with a real email API like SendGrid, Mailgun, etc.

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  body: string;
  timestamp: Date;
  referenceId: string;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  inquiryType: 'student' | 'college' | 'agency' | 'other';
  message: string;
}

// Simulated network delay
const MOCK_DELAY_MS = 1500;

// Generate a unique reference ID
const generateReferenceId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `CW-${timestamp}-${randomPart}`.toUpperCase();
};

// Map inquiry type to readable label
const getInquiryLabel = (type: string): string => {
  const labels: Record<string, string> = {
    student: 'Student / Individual Learner',
    college: 'College / University',
    agency: 'Training Agency',
    other: 'Other Inquiry',
  };
  return labels[type] || type;
};

// Format the email body
const formatEmailBody = (data: ContactFormPayload): string => {
  return `
New Contact Form Submission
============================

From: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.organization ? `Organization: ${data.organization}` : ''}

Inquiry Type: ${getInquiryLabel(data.inquiryType)}

Message:
---------
${data.message}

---
This message was sent via the CodeWeavers contact form.
  `.trim();
};

// Generate auto-reply email content
const formatAutoReplyBody = (data: ContactFormPayload, referenceId: string): string => {
  return `
Dear ${data.name},

Thank you for reaching out to CodeWeavers!

I have received your message and will get back to you within 24-48 hours.

For your reference:
- Reference ID: ${referenceId}
- Inquiry Type: ${getInquiryLabel(data.inquiryType)}
- Submitted: ${new Date().toLocaleString()}

If you have any urgent matters, feel free to reach out directly.

Best regards,
Dwarika Kumar
Tech Trainer & Software Engineer
CodeWeavers

---
This is an automated response. Please do not reply to this email.
  `.trim();
};

// Mock send email function
export async function sendContactEmail(
  data: ContactFormPayload
): Promise<{ success: boolean; referenceId: string; emails: EmailData[] }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  // Simulate occasional failures (10% chance) - disabled for demo
  // if (Math.random() < 0.1) {
  //   throw new Error('Failed to send email. Please try again.');
  // }

  const referenceId = generateReferenceId();
  const timestamp = new Date();

  // Create the notification email (to trainer)
  const notificationEmail: EmailData = {
    to: 'contact@codeweavers.in',
    from: data.email,
    subject: `[CodeWeavers] New Inquiry from ${data.name} - ${getInquiryLabel(data.inquiryType)}`,
    body: formatEmailBody(data),
    timestamp,
    referenceId,
  };

  // Create the auto-reply email (to user)
  const autoReplyEmail: EmailData = {
    to: data.email,
    from: 'contact@codeweavers.in',
    subject: `Thank you for contacting CodeWeavers! [Ref: ${referenceId}]`,
    body: formatAutoReplyBody(data, referenceId),
    timestamp,
    referenceId,
  };

  // Log emails for debugging (in production, these would be sent)
  console.log('📧 Mock Email Service - Emails Generated:');
  console.log('1. Notification to trainer:', notificationEmail);
  console.log('2. Auto-reply to user:', autoReplyEmail);

  return {
    success: true,
    referenceId,
    emails: [notificationEmail, autoReplyEmail],
  };
}

// Store submitted forms in session storage for demo purposes
export function storeSubmission(data: ContactFormPayload, referenceId: string): void {
  const submissions = getStoredSubmissions();
  submissions.push({
    ...data,
    referenceId,
    submittedAt: new Date().toISOString(),
  });
  sessionStorage.setItem('cw_submissions', JSON.stringify(submissions));
}

// Get stored submissions
export function getStoredSubmissions(): (ContactFormPayload & { referenceId: string; submittedAt: string })[] {
  try {
    const stored = sessionStorage.getItem('cw_submissions');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
