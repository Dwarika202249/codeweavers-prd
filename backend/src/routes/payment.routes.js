import express from 'express';
import Stripe from 'stripe';
import config from '../config/index.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });

// Create a Stripe Checkout session (authenticated)
router.post('/create-checkout-session', protect, asyncHandler(async (req, res) => {
  const { courseId, courseSlug } = req.body;

  let course;
  if (courseId) course = await Course.findById(courseId);
  else if (courseSlug) course = await Course.findOne({ slug: courseSlug });

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // If price is 0 or falsy, create enrollment immediately
  const price = Number(course.price || 0);
  if (!price || price <= 0) {
    // ensure not already enrolled
    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing) {
      return res.json({ success: true, data: { message: 'Already enrolled' } });
    }
    const enrollment = await Enrollment.create({ user: req.user._id, course: course._id, status: 'enrolled', paymentStatus: 'paid', pricePaid: 0 });
    return res.json({ success: true, data: { enrollment } });
  }

  // For paid courses, create or reuse a pending enrollment before checkout and include its id in Stripe session metadata
  let enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
  if (enrollment && enrollment.status === 'enrolled' && enrollment.paymentStatus === 'paid') {
    return res.json({ success: true, data: { message: 'Already enrolled' } });
  }

  if (!enrollment) {
    enrollment = await Enrollment.create({ user: req.user._id, course: course._id, status: 'pending', paymentStatus: 'pending', pricePaid: 0 });
  } else {
    // ensure it's at least pending
    enrollment.status = enrollment.status || 'pending';
    enrollment.paymentStatus = enrollment.paymentStatus || 'pending';
    await enrollment.save();
  }

  const origin = req.headers.origin || config.frontendUrl;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    locale: 'en',
    line_items: [
      {
        price_data: {
          currency: 'INR',
          unit_amount: Math.round(price * 100),
          product_data: {
            name: course.title,
            description: course.shortDescription || '',
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/bootcamps/${course.slug}?session_id={CHECKOUT_SESSION_ID}&status=success`,
    cancel_url: `${origin}/bootcamps/${course.slug}?status=cancel`,
    metadata: { userId: req.user.id, courseId: course._id.toString(), courseSlug: course.slug, enrollmentId: enrollment._id.toString() },
  });

  res.json({ success: true, data: { url: session.url, id: session.id, enrollmentId: enrollment._id } });
}));

// Webhook endpoint
// Note: stripe requires the raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
  } catch (err) {
    console.warn('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Helper to safely extract id values from Stripe objects
  const getId = (val) => (typeof val === 'string' ? val : (val && val.id ? val.id : null));

  // checkout.session.completed: successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const courseId = metadata.courseId;

    const paid = session.payment_status === 'paid';
    const amount = session.amount_total ? Number(session.amount_total) : (session.amount_subtotal ? Number(session.amount_subtotal) : 0);
    const paymentIntentId = getId(session.payment_intent);

    // Prefer enrollmentId from metadata if available
    const enrollmentId = metadata.enrollmentId;
    try {
      let enrollment = null;
      if (enrollmentId) {
        enrollment = await Enrollment.findById(enrollmentId);
      }

      // Fallback to user+course lookup for older sessions
      if (!enrollment && userId && courseId) {
        enrollment = await Enrollment.findOne({ user: userId, course: courseId });
      }

      const payload = {
        paymentProvider: 'stripe',
        paymentStatus: paid ? 'paid' : 'pending',
        pricePaid: amount ? (amount / 100) : 0,
        transactionId: paymentIntentId || null,
      };

      if (!enrollment) {
        // Create enrollment if none exists and metadata has necessary info
        if (userId && courseId) {
          await Enrollment.create({ user: userId, course: courseId, status: 'enrolled', ...payload });
          console.log('Enrollment created via Stripe webhook for user', userId, 'course', courseId);
        } else {
          console.warn('Stripe webhook checkout.session.completed: missing enrollment and metadata to create one');
        }
      } else {
        Object.assign(enrollment, payload);
        // if it was pending, mark as enrolled
        enrollment.status = 'enrolled';
        await enrollment.save();
        console.log('Enrollment updated via Stripe webhook for enrollment', enrollment._id);
      }
    } catch (err) {
      console.error('Failed to create/update enrollment from webhook:', err);
    }
  }

  // payment_intent.payment_failed: mark payment failed
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const pid = getId(paymentIntent.id) || getId(paymentIntent);
    try {
      const enrollment = await Enrollment.findOne({ transactionId: pid });
      if (enrollment) {
        enrollment.paymentStatus = 'failed';
        await enrollment.save();
        console.log('Marked enrollment payment as failed for enrollment', enrollment._id);
      }
    } catch (err) {
      console.error('Error handling payment_intent.payment_failed:', err);
    }
  }

  // charge.refunded: mark refunded and adjust pricePaid where possible
  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    const pid = getId(charge.payment_intent) || getId(charge.id);
    try {
      const enrollment = await Enrollment.findOne({ $or: [{ transactionId: pid }, { transactionId: charge.id }] });
      if (enrollment) {
        enrollment.paymentStatus = 'refunded';
        if (charge.amount_refunded) {
          const refunded = Number(charge.amount_refunded) / 100;
          enrollment.pricePaid = Math.max(0, (enrollment.pricePaid || 0) - refunded);
        }
        await enrollment.save();
        console.log('Marked enrollment as refunded for enrollment', enrollment._id);
      }
    } catch (err) {
      console.error('Error handling charge.refunded:', err);
    }
  }

  res.json({ received: true });
});

// Optional: retrieve session (authenticated) to confirm status from client
router.get('/session/:id', protect, asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  let enrollmentCreated = false;

  if (session && session.payment_status === 'paid') {
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const courseId = metadata.courseId;
    const enrollmentId = metadata.enrollmentId;

    // If an enrollmentId was provided, update that enrollment directly (and ensure user matches)
    if (enrollmentId) {
      const enrollment = await Enrollment.findById(enrollmentId);
      if (enrollment && req.user && req.user.id && String(enrollment.user) === String(req.user.id)) {
        enrollment.paymentStatus = 'paid';
        enrollment.pricePaid = session.amount_total ? Number(session.amount_total) / 100 : (session.amount_subtotal ? Number(session.amount_subtotal) / 100 : 0);
        enrollment.transactionId = (typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent && session.payment_intent.id) || null);
        enrollment.status = 'enrolled';
        await enrollment.save();
        enrollmentCreated = true;
        console.log('Enrollment updated via session retrieval for enrollment', enrollment._id);
      }
    } else if (userId && courseId) {
      // Only create enrollment if the requesting user matches metadata.userId
      if (req.user && req.user.id && String(req.user.id) === String(userId)) {
        const existing = await Enrollment.findOne({ user: userId, course: courseId });
        if (!existing) {
          await Enrollment.create({ user: userId, course: courseId, status: 'enrolled' });
          enrollmentCreated = true;
          console.log('Enrollment created via session retrieval for user', userId, 'course', courseId);
        }
      }
    }
  }

  res.json({ success: true, data: { session, enrollmentCreated } });
}));


/**
 * @route   GET /api/payments/stats/revenue
 * @desc    Get daily revenue (sum of pricePaid) for the last N days (default 30). Admin only
 * @access  Private/Admin
 */
router.get(
  '/stats/revenue',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const days = Math.max(1, Math.min(365, parseInt(req.query.days) || 30));
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0,0,0,0);

    const agg = await Enrollment.aggregate([
      { $match: { paymentStatus: 'paid', pricePaid: { $gt: 0 }, createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$pricePaid" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const map = {};
    agg.forEach((a) => { map[a._id] = { revenue: a.revenue, count: a.count }; });

    const daysArr = [];
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0,10);
      const val = map[key] || { revenue: 0, count: 0 };
      daysArr.push({ date: key, revenue: Number((val.revenue || 0).toFixed(2)), count: val.count });
    }

    res.json({ success: true, data: { days: daysArr } });
  })
);

export default router;