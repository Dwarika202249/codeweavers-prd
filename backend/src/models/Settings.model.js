import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: 'CodeWeavers' },
    tagline: { type: String, default: 'Practical, project-driven tech training' },
    supportEmail: { type: String, default: 'contact@codeweavers.in' },
    supportPhone: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    locale: { type: String, default: 'en' },
    siteUrl: { type: String, default: '' },
  },
  branding: {
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#6366F1' },
    defaultCoverImage: { type: String, default: '' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Singleton pattern: ensure only one document
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;
