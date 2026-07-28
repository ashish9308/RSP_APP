const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim())
    return res.status(400).json({ error: 'News content is required' });

  const prompt = `
You are a news fact-checking assistant. Analyze the following news content and assess its credibility.

News Content: "${content}"

Respond ONLY in this exact JSON format:
{
  "score": <integer 0-100 representing confidence that this news is credible/valid>,
  "verdict": "<one of: Verified | Likely True | Unverified | Likely False | False>",
  "summary": "<2-3 sentence explanation of why you gave this score>",
  "sources": [
    { "name": "<source name or website>", "url": "<url if known, else empty string>" }
  ]
}

Rules:
- score 80-100: strong evidence this is credible
- score 60-79: likely true but limited verification
- score 40-59: unverified, insufficient information
- score 20-39: questionable or contradicts known facts
- score 0-19: likely false or misinformation
- sources: list 2-4 known reputable sources (news agencies, government sites, Wikipedia) that could verify this type of news. If specific URLs are not known, provide the domain only.
- Return ONLY valid JSON. No markdown, no explanation.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt
    });
    const text = response.text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('Validation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
