# RRS Appeal Letter Generator

AI-powered insurance appeal letter generator for medical practices. Built by Revive Revenue Services.

## What It Does

- Collects denial claim details through a structured form
- Generates a policy-referenced, guideline-cited appeal letter using Claude AI
- Shows generation time vs. manual process time (45 min vs. seconds)
- Includes post-generation review checklist
- HIPAA-safe: uses de-identified data only (no real PHI)

## Architecture

- **Frontend:** React + Vite (deployed to Vercel)
- **Backend:** Vercel serverless function (`/api/generate.js`)
- **AI:** Anthropic Claude API (API key stored server-side, never exposed to browser)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/lsandersiii/appeal-generator.git
cd appeal-generator
npm install
```

### 2. Set API Key

Copy `.env.example` to `.env.local` and add your Anthropic API key:

```bash
cp .env.example .env.local
# Edit .env.local and replace the placeholder with your real key
```

Get an API key at: https://console.anthropic.com/settings/keys

### 3. Local Development

```bash
npm run dev
```

The app runs at `http://localhost:5173`. The Vite dev server proxies `/api` calls to the serverless function.

For local serverless function testing, install Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

This runs both the frontend and the API route locally.

### 4. Deploy to Vercel

```bash
vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deploys.

**After deploying, add the environment variable in Vercel:**
1. Go to your project in Vercel dashboard
2. Settings > Environment Variables
3. Add `ANTHROPIC_API_KEY` with your API key
4. Redeploy

## File Structure

```
appeal-generator/
  api/
    generate.js          # Vercel serverless function (proxies Anthropic API)
  src/
    main.jsx             # React entry point
    AppealLetterGenerator.jsx  # Main component
  index.html             # HTML entry
  package.json
  vite.config.js
  vercel.json            # Vercel routing config
  .env.example           # Environment variable template
```

## Security

- API key is stored in Vercel environment variables (server-side only)
- The browser never sees the API key
- All patient data should be de-identified before entry
- This is a demo tool, not for production PHI processing
- For HIPAA-covered production use, requires Claude Enterprise with BAA

## Cost

Each appeal letter generation uses approximately 1,500-2,000 tokens of Claude output. At current Anthropic API pricing, each generation costs roughly $0.01-0.03. At 20 appeals per month, expect under $1/month in API costs.
