import express from 'express';
import Stripe from 'stripe';
import config from '../config/index.js';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

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
    const enrollment = await Enrollment.create({ user: req.user._id, course: course._id, status: 'enrolled' });
    return res.json({ success: true, data: { enrollment } });
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
    metadata: { userId: req.user.id, courseId: course._id.toString(), courseSlug: course.slug },
  });

  res.json({ success: true, data: { url: session.url, id: session.id } });
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

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const courseId = metadata.courseId;

    if (userId && courseId) {
      try {
        const existing = await Enrollment.findOne({ user: userId, course: courseId });
        if (!existing) {
          await Enrollment.create({ user: userId, course: courseId, status: 'enrolled' });
          console.log('Enrollment created via Stripe webhook for user', userId, 'course', courseId);
        } else {
          console.log('Enrollment already exists (webhook) for user', userId, 'course', courseId);
        }
      } catch (err) {
        console.error('Failed to create enrollment from webhook:', err);
      }
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
    if (userId && courseId) {
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

export default router;