const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  rawContent: { type: String, required: true },
  category: { type: String, default: 'Breaking News' },
  language: { type: String, default: 'Hindi' },
  facebookContent: { type: String, default: '' },
  instagramContent: { type: String, default: '' },
  twitterContent: { type: String, default: '' },
  imageCaption: { type: String, default: '' },
  copiedTo: {
    facebook: { type: Boolean, default: false },
    instagram: { type: Boolean, default: false },
    twitter: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
