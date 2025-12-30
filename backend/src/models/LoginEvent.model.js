import mongoose from 'mongoose';

const LoginEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true }, // store date normalized to UTC midnight
}, {
  timestamps: true,
});

// ensure unique per user+date
LoginEventSchema.index({ user: 1, date: 1 }, { unique: true });

const LoginEvent = mongoose.model('LoginEvent', LoginEventSchema);
export default LoginEvent;
