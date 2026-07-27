const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

router.post('/', async (req, res) => {
  const { content, category, language } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'News content is required' });
  }

  const prompt = `
You are a social media manager for "Ranchi Samachar Patrika", a Hindi news channel from Ranchi, Jharkhand.
News Content: "${content}"
Category: ${category || 'Breaking News'}
Language Preference: ${language || 'Hindi'}

Generate platform-specific social media posts in this exact JSON format ONLY:
{
  "facebook": "Engaging Facebook post (200-400 words, use emojis, storytelling tone, end with relevant hashtags)",
  "instagram": "Instagram caption (80-120 words, energetic tone, 25-30 hashtags at the end on new lines)",
  "twitter": "Tweet (strictly under 280 characters, punchy, 2-3 hashtags only)",
  "imageCaption": "Short 6-8 word ${language || 'Hindi'} caption for the news image banner (no punctuation at end)"
}
Return ONLY valid JSON. No explanation, no markdown, no extra text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
