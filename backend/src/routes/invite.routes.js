import express from 'express';
import InviteToken from '../models/InviteToken.model.js';
import User from '../models/User.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { generateToken, protect } from '../middleware/auth.middleware.js';
import { sendEmail } from '../services/email.service.js';
import config from '../config/index.js';

const router = express.Router();

// GET /api/invite/:token - info about invite
router.get('/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invite = await InviteToken.findOne({ token }).populate('college', 'name slug whiteLabelUrl');
  if (!invite) {
    res.status(404);
    throw new Error('Invite token not found');
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    res.status(410);
    throw new Error('Invite token has expired');
  }

  if (invite.usedAt) {
    res.status(400);
    throw new Error('Invite token already used');
  }

  res.json({ success: true, data: { invite } });
}));

// POST /api/invite/:token/signup - complete signup using invite
router.post('/:token/signup', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { name, email, password, termsAccepted, studentMeta } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const invite = await InviteToken.findOne({ token });
  if (!invite) {
    res.status(404);
    throw new Error('Invite token not found');
  }

  if (invite.revoked) {
    res.status(400);
    throw new Error('Invite token has been revoked');
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    res.status(410);
    throw new Error('Invite token has expired');
  }

  if (invite.usedAt) {
    res.status(400);
    throw new Error('Invite token already used');
  }

  // If invite was restricted to an email, enforce it
  if (invite.email && String(invite.email).toLowerCase() !== String(email).toLowerCase()) {
    res.status(400);
    throw new Error('This invite is restricted to a different email');
  }

  // Create user
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const role = invite.type === 'tpo' ? 'college_admin' : 'student';

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    college: invite.college,
    studentMeta: studentMeta || {},
    termsAccepted: termsAccepted === true,
    termsAcceptedAt: termsAccepted === true ? new Date() : null,
  });

  // Mark invite used
  invite.usedBy = user._id;
  invite.usedAt = new Date();
  await invite.save();

  const jwt = generateToken(user._id);

  res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, college: user.college }, token: jwt } });
}));

// POST /api/invite/:token/resend - resend invite email (admin/college admin)
router.post('/:token/resend', protect, asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invite = await InviteToken.findOne({ token }).populate('college');
  if (!invite) {
    res.status(404);
    throw new Error('Invite not found');
  }

  if (invite.revoked) {
    res.status(400);
    throw new Error('Invite has been revoked');
  }

  if (invite.usedAt) {
    res.status(400);
    throw new Error('Invite already used');
  }

  // Access control: platform admin or college admin/TPO for that college
  const isPlatformAdmin = req.user && req.user.role === 'admin';
  const isCollegeAdmin = req.user && (['college_admin', 'tpo'].includes(req.user.role) && req.user.college && String(req.user.college) === String(invite.college._id));
  if (!isPlatformAdmin && !isCollegeAdmin) {
    res.status(403);
    throw new Error('Access denied. Admin or college TPO only.');
  }

  // Build invite URL
  let baseUrl = config.frontendUrl.replace(/\/$/, '');
  const college = invite.college;
  if (college.whiteLabelUrl) {
    baseUrl = college.whiteLabelUrl.startsWith('http') ? college.whiteLabelUrl.replace(/\/$/, '') : `${config.frontendUrl.replace(/\/$/, '')}/w/${college.whiteLabelUrl}`;
  } else if (college.customDomain) {
    baseUrl = college.customDomain.startsWith('http') ? college.customDomain.replace(/\/$/, '') : `https://${college.customDomain}`;
  }
  const inviteUrl = `${baseUrl}/invite?token=${invite.token}&college=${encodeURIComponent(college.slug)}`;

  const subject = `${college.name} - You're invited to join CodeWeavers`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
    <body>
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;margin-bottom:20px;">
          ${college.logo ? `<img src="${college.logo}" alt="${college.name}" style="height:48px;object-fit:contain;"/>` : `<h2 style="margin:0;">${college.name}</h2>`}
        </div>
        <div style="background:#fff;border:1px solid #eee;padding:20px;border-radius:6px;">
          <h3 style="margin-top:0;">You're invited to join ${college.name} on CodeWeavers</h3>
          <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:${college.theme?.primary || '#2563eb'};color:#fff;border-radius:6px;text-decoration:none;">Accept Invitation</a></p>
          <p style="word-break:break-all;">${inviteUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `You are invited to join ${college.name} on CodeWeavers. Accept here: ${inviteUrl}`;

  let emailResult = null;
  const recipient = invite.email || (req.body.email ? String(req.body.email).toLowerCase() : null);
  if (!recipient) {
    res.status(400);
    throw new Error('No recipient email available for this invite. Provide an email or create invite with an email');
  }

  try {
    emailResult = await sendEmail({ to: recipient, subject, html, text });
    invite.sentCount = (invite.sentCount || 0) + 1;
    invite.lastSentAt = new Date();
    await invite.save();
  } catch (err) {
    emailResult = { success: false, error: err.message };
  }

  res.json({ success: true, data: { invite, emailResult } });
}));

// POST /api/invite/:token/revoke - revoke an invite (admin/college admin)
router.post('/:token/revoke', protect, asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invite = await InviteToken.findOne({ token }).populate('college');
  if (!invite) {
    res.status(404);
    throw new Error('Invite not found');
  }

  // Access control
  const isPlatformAdmin = req.user && req.user.role === 'admin';
  const isCollegeAdmin = req.user && (['college_admin', 'tpo'].includes(req.user.role) && req.user.college && String(req.user.college) === String(invite.college._id));
  if (!isPlatformAdmin && !isCollegeAdmin) {
    res.status(403);
    throw new Error('Access denied. Admin or college TPO only.');
  }

  invite.revoked = true;
  invite.revokedAt = new Date();
  await invite.save();

  res.json({ success: true, data: { invite } });
}));

export default router;
