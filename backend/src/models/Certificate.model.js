import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['requested', 'issued', 'rejected', 'revoked'], default: 'requested', index: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issuedAt: { type: Date },
    fileUrl: { type: String },
    notes: { type: String },
    requestAt: { type: Date, default: Date.now },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Ensure only one certificate record per enrollment (one active certificate per enrollment)
certificateSchema.index({ enrollment: 1 }, { unique: true });

// Helper to mark as issued
certificateSchema.methods.markIssued = async function ({ issuedBy, fileUrl, notes, meta } = {}) {
  this.status = 'issued';
  this.issuedBy = issuedBy || this.issuedBy;
  this.issuedAt = new Date();
  if (fileUrl) this.fileUrl = fileUrl;
  if (notes) this.notes = notes;
  if (meta) this.meta = { ...(this.meta || {}), ...meta };
  await this.save();
  return this;
};

certificateSchema.methods.markRejected = async function ({ notes } = {}) {
  this.status = 'rejected';
  if (notes) this.notes = notes;
  await this.save();
  return this;
};

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
