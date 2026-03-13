# Environmental Aspects Toolkit

A web app for identifying and assessing environmental aspects, impacts, and opportunities for Norwegian engineering projects.

## Features
- Aspects register with live significance scoring (ISO 14001:2015 Cl.6.1.2)
- AI-powered aspect suggestion (Claude API)
- Opportunities register with CSRD double materiality
- Data saved automatically in browser localStorage
- Covers: Offshore O&G · Onshore Infrastructure · Industrial / Process

## Deploy to Vercel (free, 5 steps, no coding)

### Step 1 — Put the files on GitHub
1. Go to [github.com](https://github.com) and sign up / log in (free)
2. Click **New repository** (green button, top right)
3. Name it `env-toolkit`, leave everything else as default, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Upload ALL files from this zip — keeping the folder structure intact:
   - `package.json` (goes in root)
   - `public/index.html`
   - `src/index.js`
   - `src/App.jsx`
6. Click **Commit changes**

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and click **Sign up with GitHub** (free)
2. Click **Add New → Project**
3. Find your `env-toolkit` repository and click **Import**
4. Vercel detects it's a React app automatically — just click **Deploy**
5. Wait ~90 seconds — you get a live URL like `env-toolkit.vercel.app`

### That's it.
Share the URL with your team. Everyone can use the app in their browser.
Data is saved per-browser (localStorage), so each user has their own data.

## Run locally (optional)
```
npm install
npm start
```
Opens at http://localhost:3000

## AI suggest feature
The AI suggest panel calls the Anthropic API directly from the browser.
It works in the Claude.ai prototype because Claude injects credentials automatically.
For the deployed version, you have two options:
- **Simple**: Remove the AI panel from App.jsx — the rest of the app works without it
- **Full**: Add a small backend (e.g. a Vercel serverless function) that holds your API key securely
  See: https://vercel.com/docs/functions for how to set up a backend function

## Tech stack
- React 18
- No backend required (localStorage for data)
- Anthropic Claude API for AI suggestions
