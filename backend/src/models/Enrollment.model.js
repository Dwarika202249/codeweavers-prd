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

    // Modules & completion tracking (per-topic/lesson granularity)
    completedLessons: [
      {
        moduleIndex: { type: Number },
        topic: { type: String },
        completedAt: { type: Date, default: Date.now },
      },
    ],
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

// Methods
// Recompute progress based on course curriculum and completedLessons
enrollmentSchema.methods.recomputeProgress = async function () {
  try {
    const CourseModel = (await import('./Course.model.js')).default;
    const course = await CourseModel.findById(this.course).lean();
    if (!course || !Array.isArray(course.curriculum)) {
      this.progress = 0;
      await this.save();
      return this;
    }

    // Count total topics (treat topics as lessons)
    let total = 0;
    for (const m of course.curriculum) {
      if (Array.isArray(m.topics)) total += m.topics.length;
    }

    // Count unique completed lessons that match course curriculum
    const completedSet = new Set();
    for (const c of (this.completedLessons || [])) {
      if (typeof c.moduleIndex === 'number' && typeof c.topic === 'string') {
        completedSet.add(`${c.moduleIndex}::${c.topic}`);
      }
    }

    // Ensure completed lessons actually exist in course before counting
    let validCompleted = 0;
    for (const key of completedSet) {
      const [modIdxStr, topic] = key.split('::');
      const modIdx = Number(modIdxStr);
      const mod = course.curriculum[modIdx];
      if (mod && Array.isArray(mod.topics) && mod.topics.includes(topic)) validCompleted++;
    }

    this.progress = total ? Math.round((validCompleted / total) * 100) : 0;

    if (this.progress === 100) {
      this.status = 'completed';
      if (!this.certificateIssuedAt) this.certificateIssuedAt = new Date();
    }

    await this.save();
    return this;
  } catch (err) {
    console.error('recomputeProgress error', err);
    return this;
  }
};

// Prevent duplicate enrollment for same user+course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
