import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    organization: {
      type: String,
      trim: true,
      default: null,
    },
    subject: {
      type: String,
      enum: ['course', 'project', 'general', 'other'],
      required: [true, 'Subject is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved', 'closed'],
      default: 'new',
    },
    referenceId: {
      type: String,
      unique: true,
    },
    adminNotes: {
      type: [{
        note: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      }],
      default: [],
    },

    respondedAt: {
      type: Date,
      default: null,
    },
    // Link to user if logged in when submitting
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ subject: 1 });
contactSchema.index({ createdAt: -1 });
// Note: referenceId index is created by unique: true

// Generate reference ID before validation
contactSchema.pre('validate', function () {
  if (!this.referenceId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referenceId = `CW-${timestamp}-${random}`;
  }
});

// Ensure adminNotes is always an array on initialization (helps when migrating old docs)
contactSchema.post('init', function (doc) {
  if (!Array.isArray(doc.adminNotes)) {
    doc.adminNotes = [];
  }
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
