import mongoose from 'mongoose';
import slugify from 'slugify';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  shortDescription: { type: String },
  description: { type: String },
  duration: { type: String },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  price: { type: Number, default: 0 },
  prerequisites: [{ type: String }],
  learningOutcomes: [{ type: String }],
  // e.g. 'Mon-Wed-Fri 6-8pm' or 'Weekends'
  schedule: { type: String },
  // batchSize can be a string like '10-15' or number (keeps flexibility)
  batchSize: { type: String },
  // mode of delivery
  mode: { type: String, enum: ['Online', 'In-Person', 'Hybrid'], default: 'Online' },
  coverImage: { type: String },
  coverImageThumb: { type: String },
  instructor: { type: String },
  tags: [{ type: String }],
  targetAudience: [{ type: String }],
  topics: [{ type: String }],
  capacity: { type: Number },
  curriculum: [
    {
      week: { type: String },
      title: { type: String },
      topics: [{ type: String }],
      project: { type: String },
    },
  ],
  published: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Generate slug from title if not provided
CourseSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

const Course = mongoose.model('Course', CourseSchema);

export default Course;
