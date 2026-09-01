# AI Image Generator for MoriStorage

A creative content image generator integrated into your website. Users can describe an image and the AI will generate artwork based on their description.

## Features

✨ **Text-to-Image Generation** - Describe what you want to see, the AI creates it  
🎨 **Art Style Selection** - Choose from different artistic styles (oil painting, digital art, anime, etc.)  
🌙 **Mood/Atmosphere Options** - Set the mood (dark, cheerful, mysterious, cyberpunk, etc.)  
⬇️ **Download Generated Images** - Save artwork to your device  
🚀 **No Paid API Keys Required** - Uses free Hugging Face inference API  

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- **Express** - Web server framework
- **CORS** - Cross-origin request handling
- **Axios** - HTTP client for calling AI APIs

### 2. Configure Environment (Optional)

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` and add optional API tokens for faster generation:

- **Hugging Face Token** (free) - Speeds up Stable Diffusion requests
  - Get one at: https://huggingface.co/settings/tokens
  - Add to `.env`: `HF_TOKEN=your_token_here`

- **Clipdrop API Key** (optional fallback) - Alternative image generation service
  - Get one at: https://clipdrop.co/
  - Add to `.env`: `CLIPDROP_API_KEY=your_key_here`

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:3000`

### 4. Access the Generator

Open your browser to:
```
http://localhost:3000/image-generator.html
```

## How It Works

### Frontend (`image-generator.html` + `js/image-generator.js`)
- Beautiful UI with dark theme (matches your site aesthetic)
- Users enter a prompt, select art style and mood
- JavaScript sends request to backend
- Displays generated image with download/retry options

### Backend (`server.js`)
- Express server handles image generation requests
- Primary API: **Hugging Face Inference** with Stable Diffusion 2
- Free tier available - no credit card required
- If HF is overloaded, falls back to Clipdrop (if configured)
- Returns image as base64 data URL

## How to Integrate Into Your Site

Add a link to the image generator from your main navigation:

**In `index.html`:**
```html
<a href="image-generator.html">🎨 Image Generator</a>
```

Or embed it as an iframe for a sub-page:
```html
<iframe src="image-generator.html" width="100%" height="800"></iframe>
```

## API Reference

### POST `/api/generate-image`

**Request:**
```json
{
  "prompt": "A cyberpunk cityscape with neon lights in anime style, dark and moody"
}
```

**Response (Success):**
```json
{
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response (Error):**
```json
{
  "error": "Failed to generate image. Please try again."
}
```

## Limitations & Notes

⏱️ **Generation Time** - 30-90 seconds per image (free tier)  
📊 **Resolution** - 512x512 or 768x768 pixels (depends on model)  
🔄 **Rate Limiting** - Hugging Face has free tier limits; consider upgrading for production  
🌐 **Requires Internet** - Backend needs connection to Hugging Face API  
💾 **Stateless** - Generated images are temporary (not stored on server by default)

## Troubleshooting

### "Failed to generate image" error
- Hugging Face API might be busy - try again in a few seconds
- Check server logs for detailed error messages

### Slow generation
- First request to a model is slower (model loading)
- Add `HF_TOKEN` to speed up requests
- Hugging Face free tier has rate limits

### "Service unavailable"
- Hugging Face inference API might be down
- Try again later or add Clipdrop API key as fallback

## Future Enhancements

- [ ] Image history/gallery of user-generated images
- [ ] Social sharing features
- [ ] Advanced parameters (resolution, guidance scale, steps)
- [ ] Model selection dropdown
- [ ] Upscaling generated images
- [ ] Batch image generation
- [ ] Integration with your game for in-game asset generation

## Free APIs Used

- **Hugging Face Inference API** - https://huggingface.co/inference-api
  - Free tier: No credit card required
  - Models available: Stable Diffusion 2, 2.1, v1.5, etc.
  - Rate limit: ~3 requests/minute free tier

- **Clipdrop** (Optional fallback) - https://clipdrop.co/
  - Free tier available
  - Alternative to Hugging Face if needed

## License

MIT - Feel free to modify and use as you like!

## Questions?

Check the code comments in `server.js` and `js/image-generator.js` for more details.
