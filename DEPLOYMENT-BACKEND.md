# Deploying the Image Generator Backend to Vercel

The frontend (`image-generator.html`) is now on GitHub Pages, but it needs a backend to handle image generation. Follow these steps to deploy it to **Vercel** (free tier).

## Quick Setup (5 minutes)

### 1. Create a New GitHub Repository for the Backend

Create a new repo called `mori-image-gen-backend` and clone it locally:

```bash
git clone https://github.com/YOUR_USERNAME/mori-image-gen-backend.git
cd mori-image-gen-backend
```

### 2. Create Backend Files

Create these files in your backend repo:

**`package.json`**
```json
{
  "name": "mori-image-gen-backend",
  "version": "1.0.0",
  "description": "AI Image Generator backend for MoriStorage",
  "main": "api/generate-image.js",
  "scripts": {
    "start": "node api/generate-image.js",
    "dev": "nodemon api/generate-image.js"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

**`api/generate-image.js`** (Vercel Serverless Function)
```javascript
import axios from 'axios';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('Generating image for prompt:', prompt);

    // Try Hugging Face Inference API
    const hfToken = process.env.HF_TOKEN || '';
    
    const huggingFaceResponse = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
        },
        responseType: 'arraybuffer',
        timeout: 120000, // 2 minutes timeout
      }
    );

    const imageBuffer = Buffer.from(huggingFaceResponse.data, 'binary');
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return res.status(200).json({ imageUrl });
  } catch (huggingFaceError) {
    console.error('Hugging Face error:', huggingFaceError.message);

    // Fallback to Clipdrop if HF fails
    try {
      const clipdropKey = process.env.CLIPDROP_API_KEY;
      
      if (!clipdropKey) {
        return res.status(503).json({ 
          error: 'Image generation temporarily unavailable. Please try again later.' 
        });
      }

      const clipdropResponse = await axios.post(
        'https://clipdrop-api.co/text-to-image/v1',
        { prompt },
        {
          headers: {
            'x-api-key': clipdropKey,
          },
          responseType: 'arraybuffer',
          timeout: 120000,
        }
      );

      const imageBuffer = Buffer.from(clipdropResponse.data, 'binary');
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      return res.status(200).json({ imageUrl });
    } catch (clipdropError) {
      console.error('Clipdrop error:', clipdropError.message);
      return res.status(503).json({ 
        error: 'All image generation services are currently unavailable. Please try again later.' 
      });
    }
  }
}
```

**`.env.example`**
```
HF_TOKEN=your_hugging_face_token_here
CLIPDROP_API_KEY=your_clipdrop_key_here_optional
```

**`.gitignore`**
```
node_modules/
.env
.env.local
.DS_Store
```

### 3. Push to GitHub

```bash
git add .
git commit -m "Initial backend setup for Vercel deployment"
git push origin main
```

### 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click "New Project" or "Import"
3. Select your GitHub repo (`mori-image-gen-backend`)
4. Vercel will auto-detect it's a Node.js project
5. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add `HF_TOKEN`: Get from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) (create a free account)
   - Optionally add `CLIPDROP_API_KEY` from [clipdrop.co](https://clipdrop.co/)
6. Click "Deploy"

### 5. Update the Frontend

Once deployed, Vercel will give you a URL like `https://mori-image-gen-backend.vercel.app`

Update **`js/image-generator.js`** line 2:
```javascript
const API_ENDPOINT = 'https://mori-image-gen-backend.vercel.app/api/generate-image';
```

(Replace with your actual Vercel URL)

Push this change to your GitHub Pages repo.

## That's it! 🎉

Your image generator is now live at `https://MoriStorage.github.io/image-generator.html`

## Getting API Tokens (Free)

### Hugging Face Token
1. Sign up at https://huggingface.co
2. Go to Settings → Access Tokens
3. Create a new token (select "read" permission)
4. Add to Vercel environment variables as `HF_TOKEN`

### Clipdrop Key (Optional Backup)
1. Sign up at https://clipdrop.co
2. Go to API section
3. Create an API key
4. Add to Vercel environment variables as `CLIPDROP_API_KEY`

## Troubleshooting

- **"Failed to generate image"** → Check that HF_TOKEN is set in Vercel environment variables
- **CORS errors** → Make sure the API endpoint in `js/image-generator.js` matches your Vercel URL
- **Slow generation** → First request takes longer (model loading). Subsequent requests are faster.
- **"Service unavailable"** → Hugging Face API might be overloaded. Try again in a few seconds.

## Free Tier Limits

- **Hugging Face**: ~3 requests/minute free tier
- **Vercel**: 100GB bandwidth/month free, unlimited API calls
- **GitHub Pages**: Free hosting for static files

Total cost: **$0** 🎉
