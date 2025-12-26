import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: { type: String, enum: ['enrolled', 'interest', 'completed', 'cancelled'], default: 'enrolled' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollment for same user+course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
