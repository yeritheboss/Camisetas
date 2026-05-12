import express from 'express';
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi} from 'openai';

dotenv.config();

const router = express.Router();

const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
const config = hasOpenAiKey
  ? new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const openai = config ? new OpenAIApi(config) : null;

const generateWithPollinations = async (prompt) => {
  const imageUrl = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  imageUrl.searchParams.set('width', '1024');
  imageUrl.searchParams.set('height', '1024');
  imageUrl.searchParams.set('model', 'flux');
  imageUrl.searchParams.set('nologo', 'true');

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Pollinations failed with status ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString('base64');
};

const generateWithOpenAi = async (prompt) => {
  const response = await openai.createImage({
    prompt,
    n: 1,
    size: '1024x1024',
    response_format: 'b64_json'
  });

  return response.data.data[0].b64_json;
};

router.route('/').get((req, res) => {
  res.status(200).json({ message: "Hello from DALL.E ROUTES" })
})

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const image = hasOpenAiKey
      ? await generateWithOpenAi(prompt)
      : await generateWithPollinations(prompt);

    res.status(200).json({ photo: image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image generation failed" })
  }
})

export default router;
