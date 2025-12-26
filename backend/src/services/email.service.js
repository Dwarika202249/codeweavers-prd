import { Resend } from 'resend';
import config from '../config/index.js';

// Initialize Resend client
const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

/**
 * Send email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Plain text fallback
 * @returns {Promise<Object>} - Resend response
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: config.emailFrom,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send contact form notification to admin
 */
export async function sendContactNotification(contact) {
  const subject = `New Contact Inquiry: ${contact.subject}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #4b5563; }
        .value { margin-top: 5px; }
        .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .badge-course { background: #dbeafe; color: #1d4ed8; }
        .badge-project { background: #dcfce7; color: #15803d; }
        .badge-general { background: #f3e8ff; color: #7c3aed; }
        .badge-other { background: #fef3c7; color: #b45309; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">New Contact Inquiry</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Reference: ${contact.referenceId}</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">From:</div>
            <div class="value">${contact.name} &lt;${contact.email}&gt;</div>
          </div>
          <div class="field">
            <div class="label">Subject Type:</div>
            <div class="value">
              <span class="badge badge-${contact.subject}">${contact.subject.charAt(0).toUpperCase() + contact.subject.slice(1)}</span>
            </div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value" style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
              ${contact.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div class="field">
            <div class="label">Received:</div>
            <div class="value">${new Date(contact.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div class="footer">
          <p>CodeWeavers Contact System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Inquiry
Reference: ${contact.referenceId}

From: ${contact.name} <${contact.email}>
Subject: ${contact.subject}

Message:
${contact.message}

Received: ${new Date(contact.createdAt).toLocaleString()}
  `.trim();

  return sendEmail({
    to: config.adminEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send confirmation email to user after contact form submission
 */
export async function sendContactConfirmation(contact) {
  const subject = `We've received your message - CodeWeavers`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .reference { background: #f3f4f6; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; }
        .reference-id { font-size: 18px; font-weight: bold; color: #667eea; font-family: monospace; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        .social-links { margin-top: 15px; }
        .social-links a { color: #9ca3af; text-decoration: none; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Thank You!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message</p>
        </div>
        <div class="content">
          <p>Hi ${contact.name},</p>
          <p>Thank you for reaching out to CodeWeavers! We've received your message and will get back to you as soon as possible, typically within 24-48 hours.</p>
          
          <div class="reference">
            <p style="margin: 0 0 5px 0; color: #6b7280;">Your reference number:</p>
            <div class="reference-id">${contact.referenceId}</div>
          </div>
          
          <p><strong>Your message summary:</strong></p>
          <p style="background: #f9fafb; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea;">
            ${contact.message.substring(0, 200)}${contact.message.length > 200 ? '...' : ''}
          </p>
          
          <p>In the meantime, feel free to explore our latest courses and resources!</p>
          
          <p>Best regards,<br><strong>The CodeWeavers Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CodeWeavers. All rights reserved.</p>
          <div class="social-links">
            <a href="#">LinkedIn</a> |
            <a href="#">GitHub</a> |
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${contact.name},

Thank you for reaching out to CodeWeavers! We've received your message and will get back to you as soon as possible, typically within 24-48 hours.

Your reference number: ${contact.referenceId}

Your message summary:
${contact.message.substring(0, 200)}${contact.message.length > 200 ? '...' : ''}

In the meantime, feel free to explore our latest courses and resources!

Best regards,
The CodeWeavers Team
  `.trim();

  return sendEmail({
    to: contact.email,
    subject,
    html,
    text,
  });
}

export default {
  sendEmail,
  sendContactNotification,
  sendContactConfirmation,
};
