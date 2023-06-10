const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
require('dotenv').config();
app.use(express.json());

// allow local front end to access
app.use(cors({
  origin: 'http://10.62.72.169:3000'
}));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// include API key from front end app
app.post('/api/ask', ensureCorrectApiKey, async (req, res) => {
  // app.post('/api/ask', async (req, res) => {
  const { question, context } = req.body;

  const data = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: question,
      },
      {
        role: 'assistant',
        content: context,
      },
    ],
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.json({ error: error.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));

function ensureCorrectApiKey(req, res, next) {
  const providedApiKey = req.get('X-API-KEY');
  const correctApiKey = process.env.CORRECT_API_KEY;
  if (providedApiKey !== correctApiKey) {
    return res.status(403).send('Invalid API key');
  }
  next();
}