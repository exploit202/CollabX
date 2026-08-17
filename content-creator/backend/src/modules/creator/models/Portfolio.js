const mongoose = require('mongoose');

const portfolio = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    title: { type: String, required: true },
    description: String,
    brandName: String,
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    thumbnail: String,
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

portfolio.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('Portfolio', portfolio);