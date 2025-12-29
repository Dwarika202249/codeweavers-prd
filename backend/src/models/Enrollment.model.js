import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: { type: String, enum: ['enrolled', 'pending', 'interest', 'completed', 'cancelled'], default: 'enrolled' },
    progress: { type: Number, min: 0, max: 100, default: 0 },

    // Payment & transactions
    pricePaid: { type: Number, default: 0 },
    paymentProvider: { type: String },
    paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    transactionId: { type: String },
    invoiceId: { type: String },

    // Schedule / cohort
    startDate: { type: Date },
    endDate: { type: Date },
    cohort: { type: String },

    // Modules & completion tracking
    completedModules: [{ type: mongoose.Schema.Types.Mixed }],

    // Assignments & submissions (simple file upload reference)
    assignments: [
      {
        title: { type: String },
        fileUrl: { type: String },
        filename: { type: String },
        uploadedAt: { type: Date },
        notes: { type: String },
        grade: { type: String },
        feedback: { type: String },
      },
    ],

    // Admin notes for internal tracking and actions
    adminNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    certificateIssuedAt: { type: Date },
    refundRequested: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollment for same user+course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
