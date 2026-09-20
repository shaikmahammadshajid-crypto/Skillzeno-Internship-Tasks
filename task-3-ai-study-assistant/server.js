import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '20kb' }));
app.use(express.static('.'));

app.post('/api/study', async (req, res) => {
  const { prompt, mode = 'explain' } = req.body ?? {};
  if (typeof prompt !== 'string' || prompt.trim().length < 3) {
    return res.status(400).json({ error: 'Please enter a question with at least 3 characters.' });
  }
  if (prompt.length > 4000) return res.status(400).json({ error: 'Please keep your question under 4,000 characters.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI service is not configured yet. Add OPENAI_API_KEY to the server environment.' });

  const instructions = {
    explain: 'Explain the topic in a clear, student-friendly way. Use short headings and examples where helpful.',
    quiz: 'Create a short 5-question quiz about this topic. Include answers after a clear divider.',
    summarize: 'Create a concise study summary with key ideas, definitions, and a short recap.'
  }[mode] || 'Explain the topic in a clear, student-friendly way.';

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: 'gpt-5',
      instructions: `You are StudySpark, a friendly academic study assistant. ${instructions}`,
      input: prompt.trim(),
      store: false
    });
    const answer = response.output_text?.trim();
    if (!answer) return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' });
    res.json({ answer });
  } catch (error) {
    console.error('Study assistant error:', error?.message);
    res.status(502).json({ error: 'The AI service could not complete that request. Please try again in a moment.' });
  }
});

app.listen(port, () => console.log(`StudySpark is running on http://localhost:${port}`));
