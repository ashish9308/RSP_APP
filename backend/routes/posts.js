const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Save new post
router.post('/', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { rawContent: { $regex: search, $options: 'i' } }
      : {};
    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(100);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update copied status
router.patch('/:id/copied', async (req, res) => {
  try {
    const { platform } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: { [`copiedTo.${platform}`]: true } },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
