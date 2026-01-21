import mongoose from 'mongoose';
import slugify from 'slugify';

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    verified: { type: Boolean, default: false },
    whiteLabelUrl: { type: String, default: '' },
    customDomain: { type: String, default: '' },
    logo: { type: String, default: '' },
    theme: {
      primary: { type: String, default: '#2563eb' },
      accent: { type: String, default: '#06b6d4' },
    },
    allowedEmailDomains: { type: [String], default: [] },
    subscriptionPlan: { type: String, default: 'free' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

collegeSchema.pre('validate', function () {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const College = mongoose.model('College', collegeSchema);
export default College;
