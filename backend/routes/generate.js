const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  "facebook": "#राँची: <Engaging Facebook post — 200-300 words maximum, use emojis, storytelling tone, end with relevant hashtags>",
  "instagram": "#राँची: <Instagram caption — 80-120 words, energetic tone, 25-30 hashtags at the end on new lines>",
  "twitter": "#राँची: <Tweet — strictly under 260 characters after the prefix, punchy, 2-3 hashtags only>",
  "imageCaption": "Short 6-8 word ${language || 'Hindi'} caption for the news image banner (no punctuation at end)"
}
Return ONLY valid JSON. No explanation, no markdown, no extra text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt
    });
    const text = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);
    // Remove markdown bold/italic markers Gemini sometimes adds
    parsed.facebook = parsed.facebook?.replace(/\*\*/g, '').replace(/\*/g, '');
    parsed.instagram = parsed.instagram?.replace(/\*\*/g, '').replace(/\*/g, '');
    parsed.twitter = parsed.twitter?.replace(/\*\*/g, '').replace(/\*/g, '');
    res.json(parsed);
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
