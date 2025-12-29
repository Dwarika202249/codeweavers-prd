import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    link: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          try {
            const u = new URL(v);
            const host = (u.hostname || '').toLowerCase();
            return (u.protocol === 'http:' || u.protocol === 'https:') && (host.endsWith('github.com') || host.endsWith('gist.github.com') || host.endsWith('githubusercontent.com'));
          } catch (e) {
            return false;
          }
        },
        message: 'Link must be a valid GitHub URL',
      },
    },
    notes: { type: String },
    status: { type: String, enum: ['submitted', 'graded', 'rejected'], default: 'submitted', index: true },
    score: { type: Number },
    feedback: { type: String },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
    resubmissionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// One submission per assignment+enrollment pair (students resubmit the same record when allowed)
submissionSchema.index({ assignment: 1, enrollment: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
