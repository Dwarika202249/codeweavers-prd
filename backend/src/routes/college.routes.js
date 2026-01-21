import express from 'express';
import College from '../models/College.model.js';
import InviteToken from '../models/InviteToken.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly, generateToken } from '../middleware/auth.middleware.js';
import { sendEmail } from '../services/email.service.js';
import config from '../config/index.js';

const router = express.Router();

// Create a new college (admin only)
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { name, whiteLabelUrl, customDomain, logo, allowedEmailDomains } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Name is required');
  }

  const slugCandidate = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existing = await College.findOne({ $or: [{ slug: slugCandidate }, { whiteLabelUrl }, { customDomain }] });
  if (existing) {
    res.status(400);
    throw new Error('A college with similar slug or domain already exists');
  }

  const college = await College.create({ name, slug: slugCandidate, whiteLabelUrl: whiteLabelUrl || '', customDomain: customDomain || '', logo: logo || '', allowedEmailDomains: Array.isArray(allowedEmailDomains) ? allowedEmailDomains : [] , createdBy: req.user._id });

  res.status(201).json({ success: true, data: { college } });
}));

// Admin: list colleges
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, q = '' } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(200, Number(limit) || 50);
  const qStr = String(q || '').trim();

  const filter = {};
  if (qStr) {
    filter.$or = [
      { name: { $regex: qStr, $options: 'i' } },
      { slug: { $regex: qStr, $options: 'i' } },
      { whiteLabelUrl: { $regex: qStr, $options: 'i' } },
    ];
  }

  const [colleges, total] = await Promise.all([
    College.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
    College.countDocuments(filter),
  ]);

  res.json({ success: true, data: { colleges, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } } });
}));

// Public: College signup (creates unverified college + initial college admin account)
router.post('/signup', asyncHandler(async (req, res) => {
  const { name, whiteLabelUrl, customDomain, logo, allowedEmailDomains, adminName, adminEmail, adminPassword } = req.body;

  if (!name || !adminName || !adminEmail || !adminPassword) {
    res.status(400);
    throw new Error('College name and admin name/email/password are required');
  }

  // Check slug collisions
  const slugCandidate = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existingCollege = await College.findOne({ $or: [{ slug: slugCandidate }, { whiteLabelUrl }, { customDomain }] });
  if (existingCollege) {
    res.status(400);
    throw new Error('A college with similar slug or domain already exists');
  }

  // Prevent duplicate user
  const existingUser = await (await import('../models/User.model.js')).default.findOne({ email: adminEmail.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('A user with this email already exists. Please login or use a different email');
  }

  // Create college and admin user (best-effort cleanup on failure)
  let college = null;
  let adminUser = null;
  try {
    college = await College.create({ name, slug: slugCandidate, whiteLabelUrl: whiteLabelUrl || '', customDomain: customDomain || '', logo: logo || '', allowedEmailDomains: Array.isArray(allowedEmailDomains) ? allowedEmailDomains : [], verified: false });

    const User = (await import('../models/User.model.js')).default;
    adminUser = await User.create({ name: adminName, email: adminEmail.toLowerCase(), password: adminPassword, role: 'college_admin', college: college._id, isEmailVerified: false });

    // link createdBy
    college.createdBy = adminUser._id;
    await college.save();

    // Notify platform admin
    try {
      const subject = `New college signup: ${college.name}`;
      const html = `<p>New college has signed up.</p><p>Name: ${college.name}</p><p>Admin: ${adminName} &lt;${adminEmail}&gt;</p><p>Verify here: ${config.frontendUrl}/admin/colleges</p>`;
      await sendEmail({ to: config.adminEmail, subject, html, text: `New college: ${college.name}. Admin: ${adminName} <${adminEmail}>` });
    } catch (e) {
      console.warn('Failed to notify admin about new college signup', e);
    }

    // Generate token for admin user
    const token = generateToken(adminUser._id);

    res.status(201).json({ success: true, data: { college, admin: { id: adminUser._id, name: adminUser.name, email: adminUser.email }, token } });
  } catch (err) {
    // Cleanup partially created records
    try { if (adminUser && adminUser._id) await (await import('../models/User.model.js')).default.findByIdAndDelete(adminUser._id); } catch (e) {}
    try { if (college && college._id) await College.findByIdAndDelete(college._id); } catch (e) {}
    throw err;
  }
}));

// Admin: verify a college (admin only)
router.post('/:id/verify', protect, adminOnly, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verified = true } = req.body;

  const college = await College.findById(id);
  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }

  college.verified = !!verified;
  await college.save();

  // Notify college admin (if exists)
  try {
    const User = (await import('../models/User.model.js')).default;
    const adminUser = await User.findOne({ college: college._id, role: 'college_admin' });
    if (adminUser && adminUser.email) {
      const subject = `Your college (${college.name}) has been ${college.verified ? 'verified' : 'updated'}`;
      const html = `<p>Your college <strong>${college.name}</strong> is now ${college.verified ? 'verified' : 'updated'} on CodeWeavers. ${college.verified ? 'White-label features are now enabled for your college.' : ''}</p>`;
      await sendEmail({ to: adminUser.email, subject, html, text: `Your college ${college.name} is now ${college.verified ? 'verified' : 'updated'}.` });
    }
  } catch (e) {
    console.warn('Failed to notify college admin on verification', e);
  }

  res.json({ success: true, data: { college } });
}));

// Create an invite token for a college (admin or college_admin can use via admin role for now)
router.post('/:id/invite', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type = 'student', email, expiresInHours = 168 } = req.body; // default 7 days

  const college = await College.findById(id);
  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }

  // Only platform admins or college admins/TPOs for this college can create invites
  const isPlatformAdmin = req.user && req.user.role === 'admin';
  const isCollegeAdmin = req.user && (['college_admin', 'tpo'].includes(req.user.role) && req.user.college && String(req.user.college) === String(college._id));
  if (!isPlatformAdmin && !isCollegeAdmin) {
    res.status(403);
    throw new Error('Access denied. Admin or college TPO only.');
  }

  const expiresAt = new Date(Date.now() + Number(expiresInHours) * 3600 * 1000);
  const tokenDoc = InviteToken.generate({ college: college._id, type, email: email ? String(email).toLowerCase() : '', createdBy: req.user._id, expiresAt });
  await tokenDoc.save();

  // Build a white-labelled invite URL (prefer college.whiteLabelUrl or customDomain, otherwise fallback to frontend)
  let baseUrl = config.frontendUrl.replace(/\/$/, '');
  if (college.whiteLabelUrl) {
    baseUrl = college.whiteLabelUrl.startsWith('http') ? college.whiteLabelUrl.replace(/\/$/, '') : `${config.frontendUrl.replace(/\/$/, '')}/w/${college.whiteLabelUrl}`;
  } else if (college.customDomain) {
    baseUrl = college.customDomain.startsWith('http') ? college.customDomain.replace(/\/$/, '') : `https://${college.customDomain}`;
  }

  const inviteUrl = `${baseUrl}/invite?token=${tokenDoc.token}&college=${encodeURIComponent(college.slug)}`;

  // Optionally send invite email if email provided
  let emailResult = null;
  if (email) {
    const subject = `${college.name} - You're invited to join CodeWeavers`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>body{font-family:Arial,Helvetica,sans-serif;color:#111}</style>
      </head>
      <body>
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="text-align:center;margin-bottom:20px;">
            ${college.logo ? `<img src="${college.logo}" alt="${college.name}" style="height:48px;object-fit:contain;"/>` : `<h2 style="margin:0;">${college.name}</h2>`}
          </div>
          <div style="background:#fff;border:1px solid #eee;padding:20px;border-radius:6px;">
            <h3 style="margin-top:0;">You're invited to join ${college.name} on CodeWeavers</h3>
            <p>Click the button below to complete your registration and connect your account to ${college.name}.</p>
            <p style="text-align:center;margin:24px 0;"><a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:${college.theme?.primary || '#2563eb'};color:#fff;border-radius:6px;text-decoration:none;">Accept Invitation</a></p>
            <p>If the button doesn't work, open this link in your browser:</p>
            <p style="word-break:break-all;">${inviteUrl}</p>
            <p style="color:#6b7280;font-size:12px;margin-top:12px;">This invite will expire on ${tokenDoc.expiresAt.toUTCString()}.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `You are invited to join ${college.name} on CodeWeavers. Accept here: ${inviteUrl} (expires: ${tokenDoc.expiresAt.toUTCString()})`;

    try {
      emailResult = await sendEmail({ to: String(email).toLowerCase(), subject, html, text });
      tokenDoc.sentCount = (tokenDoc.sentCount || 0) + 1;
      tokenDoc.lastSentAt = new Date();
      await tokenDoc.save();
    } catch (err) {
      console.error('Failed to send invite email', err);
      emailResult = { success: false, error: err.message };
    }
  }

  res.status(201).json({ success: true, data: { token: tokenDoc.token, expiresAt: tokenDoc.expiresAt, inviteUrl, emailResult } });
}));

// Get invites for a college (admin or college admin)
router.get('/:id/invites', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const college = await College.findById(id);
  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }

  // Access control
  const isPlatformAdmin = req.user && req.user.role === 'admin';
  const isCollegeAdmin = req.user && (['college_admin', 'tpo'].includes(req.user.role) && req.user.college && String(req.user.college) === String(college._id));
  if (!isPlatformAdmin && !isCollegeAdmin) {
    res.status(403);
    throw new Error('Access denied. Admin or college TPO only.');
  }

  const { page = 1, limit = 50 } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(200, Number(limit) || 50);

  const [invites, total] = await Promise.all([
    InviteToken.find({ college: college._id }).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).lean(),
    InviteToken.countDocuments({ college: college._id }),
  ]);

  const usedCount = await InviteToken.countDocuments({ college: college._id, usedAt: { $ne: null } });
  const revokedCount = await InviteToken.countDocuments({ college: college._id, revoked: true });
  const activeCount = total - usedCount - revokedCount;

  res.json({ success: true, data: { invites, stats: { total, usedCount, revokedCount, activeCount }, pagination: { page: p, limit: l } } });
}));

export default router;
