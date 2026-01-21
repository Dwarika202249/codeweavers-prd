import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteTokenSchema = new mongoose.Schema(
  {
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['student', 'tpo'], default: 'student' },
    email: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    usedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    // tracking
    sentCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

inviteTokenSchema.statics.generate = function (attrs = {}) {
  const token = crypto.randomBytes(20).toString('hex');
  const doc = new this({ token, ...attrs });
  return doc;
};

const InviteToken = mongoose.model('InviteToken', inviteTokenSchema);
export default InviteToken;
