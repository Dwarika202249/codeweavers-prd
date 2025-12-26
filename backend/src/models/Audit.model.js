import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g., 'user_role_changed'
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, required: true }, // e.g., 'User'
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Audit = mongoose.model('Audit', auditSchema);

export default Audit;
