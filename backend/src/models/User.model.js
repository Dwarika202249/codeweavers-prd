import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // consecutive current login streak in days
    currentLoginStreak: {
      type: Number,
      default: 0,
    },
    // longest recorded login streak
    longestLoginStreak: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Helper: normalize a Date to UTC midnight (date-only)
function toUtcDateOnly(d) {
  const date = new Date(d);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Update last login and maintain streaks and a daily login event
userSchema.methods.updateLastLogin = async function () {
  try {
    const now = new Date();
    const today = toUtcDateOnly(now);

    // dynamic import to avoid circular deps
    const LoginEvent = (await import('./LoginEvent.model.js')).default;

    // upsert today's login event (create only once)
    await LoginEvent.findOneAndUpdate(
      { user: this._id, date: today },
      { $setOnInsert: { user: this._id, date: today } },
      { upsert: true }
    );

    // previous login date normalized
    const prev = this.lastLoginAt ? toUtcDateOnly(this.lastLoginAt) : null;

    if (prev && prev.getTime() === today.getTime()) {
      // already logged in today — no change
    } else if (prev) {
      // check if previous login was yesterday (UTC)
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      if (prev.getTime() === yesterday.getTime()) {
        this.currentLoginStreak = (this.currentLoginStreak || 0) + 1;
      } else {
        this.currentLoginStreak = 1;
      }
    } else {
      // first login
      this.currentLoginStreak = 1;
    }

    // update longest streak
    if (!this.longestLoginStreak || this.currentLoginStreak > this.longestLoginStreak) {
      this.longestLoginStreak = this.currentLoginStreak;
    }

    this.lastLoginAt = now;
    return this.save();
  } catch (err) {
    // don't throw — preserve login even if streak tracking fails
    console.warn('Failed to update login streak', err);
    this.lastLoginAt = new Date();
    return this.save();
  }
};

const User = mongoose.model('User', userSchema);

export default User;
