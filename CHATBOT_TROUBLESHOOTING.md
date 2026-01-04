# 🤖 FilmHub AI Chatbot - Troubleshooting Guide

## Quick Fix Steps

### 1. **Check API Key Configuration**

Visit this URL while your dev server is running:

```
http://localhost:3000/api/chat/test
```

This will tell you if your API key is configured correctly.

---

### 2. **Set Up Gemini API Key**

#### Step 1: Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Select "Create API key in new project" or use existing project
5. **Copy the generated key** (starts with `AIza...`)

#### Step 2: Add to .env.local

Open or create the file `.env.local` in your project root and add:

```env
# Gemini AI API Key
GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here

# Your other environment variables...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Important:**

- Replace `AIzaSyC_your_actual_api_key_here` with your real API key
- Make sure there are NO spaces around the `=` sign
- Make sure there are NO quotes around the key

#### Step 3: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

### 3. **Common Error Messages**

#### Error: "API Key is not configured"

**Solution:** Add `GEMINI_API_KEY` to your `.env.local` file

#### Error: "Failed to fetch"

**Solutions:**

- Make sure dev server is running (`npm run dev`)
- Check your internet connection
- Check browser console for more details

#### Error: "HTTP error! status: 500"

**Solutions:**

- API key might be invalid - verify it's correct
- Check the terminal/console for detailed error logs
- API quota might be exceeded (free tier has limits)

#### Error: "Network error"

**Solutions:**

- Firewall might be blocking the request
- Check if you can access https://generativelanguage.googleapis.com

---

### 4. **Test the Chatbot**

1. Open your FilmHub website
2. Click the red chat button in bottom-right corner
3. Try typing: "What movies do you have?"
4. The chatbot should respond in a few seconds

---

### 5. **API Key Limits**

Free Gemini API has these limits:

- **60 requests per minute**
- **1,500 requests per day**

If you hit the limit, wait a few minutes or upgrade to paid tier.

---

## Debugging Checklist

- [ ] .env.local file exists in project root
- [ ] GEMINI_API_KEY is present in .env.local
- [ ] API key starts with "AIza"
- [ ] No extra spaces or quotes in .env.local
- [ ] Dev server has been restarted after adding key
- [ ] Test endpoint shows "configured": http://localhost:3000/api/chat/test
- [ ] Browser console shows no errors
- [ ] Internet connection is working

---

## Still Not Working?

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try sending a message in chatbot
4. Look for error messages in red

### Check Server Logs

1. Look at your terminal where `npm run dev` is running
2. Look for error messages when you send a chat message
3. Share these errors if you need help

### Test API Key Manually

Run this in a separate file to test your API key:

```javascript
// test-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDySKW3C7jjKC7vNBwOTEJVN0cOL_KDBnU");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const result = await model.generateContent("Say hello!");
const response = await result.response;
console.log(response.text());
```

Run with: `node test-gemini.js`

---

## Enhanced Error Messages

The chatbot now provides helpful error messages:

- 🔑 Shows API key issues with link to get one
- ⚠️ Shows network/connection problems
- 💬 Shows server errors with diagnostic info

---

## Need More Help?

1. Check the terminal where dev server is running for errors
2. Check browser console (F12 → Console tab)
3. Visit `/api/chat/test` to verify API key setup
4. Make sure you're using Gemini API (not Google AI Studio chat)

---

## Example .env.local File

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AI Chatbot
GEMINI_API_KEY=AIzaSyC_your_actual_gemini_api_key_here_xxxxx

# Other APIs (if you have them)
TMDB_API_KEY=your_tmdb_key_if_any
```

---

**Your chatbot is now ready! 🎬✨**
