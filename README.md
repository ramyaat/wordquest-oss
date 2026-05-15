# 🎯 Word Quest — Battle of Words

A Duolingo-style vocabulary competition trainer for school spelling bees and word competitions. Students log in with their name and a 4-digit PIN, work through daily word lists with flashcards and quizzes, earn XP, and compete on a live leaderboard.

**Live features:**
- 📚 Flashcard review with flip animations
- 🧠 Multiple-choice quiz with lives (hearts)
- 🏆 Live leaderboard
- 📊 Progress tracking across 20 days
- 📱 Works on phones, tablets, and desktops
- 🔒 Per-player PIN authentication

---

## Table of Contents

1. [How to customise the word list](#1-how-to-customise-the-word-list)
2. [How to change game settings](#2-how-to-change-game-settings)
3. [Setting up for the first time (non-technical guide)](#3-setting-up-for-the-first-time-non-technical-guide)
   - [Step 1 — Install the tools you need](#step-1--install-the-tools-you-need)
   - [Step 2 — Get the code onto your computer](#step-2--get-the-code-onto-your-computer)
   - [Step 3 — Customise the word list](#step-3--customise-the-word-list)
   - [Step 4 — Run it locally to test](#step-4--run-it-locally-to-test)
   - [Step 5 — Put it on the internet (Vercel)](#step-5--put-it-on-the-internet-vercel)
   - [Step 6 — Add a database so scores are saved (Vercel KV)](#step-6--add-a-database-so-scores-are-saved-vercel-kv)
   - [Step 7 — Add the secret database keys to your app](#step-7--add-the-secret-database-keys-to-your-app)
   - [Step 8 — Redeploy and verify](#step-8--redeploy-and-verify)
4. [Sharing the app with students](#4-sharing-the-app-with-students)
5. [Resetting scores between competitions](#5-resetting-scores-between-competitions)
6. [Troubleshooting](#6-troubleshooting)
7. [Project structure (for developers)](#7-project-structure-for-developers)

---

## 1. How to customise the word list

Open the file **`words.json`** in the root of the project folder. It looks like this:

```json
[
  {
    "word": "Aberration",
    "pronunciation": "ab-uh-RAY-shun",
    "definition": "A thing that differs from what is normal or expected.",
    "synonyms": ["anomaly", "deviation", "irregularity"],
    "antonyms": ["norm", "standard", "conformity"],
    "example": "The teacher said the rude outburst was an aberration.",
    "day": 1
  },
  ...
]
```

**To add, remove, or change words:**

1. Open `words.json` in any text editor (Notepad on Windows, TextEdit on Mac, or VS Code).
2. Each word is one block starting with `{` and ending with `}`, separated by commas.
3. Make your changes — to add a word, copy an existing block, paste it, and fill in the new details. To delete a word, delete the entire block (including its comma).
4. Save the file.
5. Redeploy to Vercel (see [Step 8](#step-8--redeploy-and-verify)).

**Rules for words.json:**
- Every word must have all 7 fields: `word`, `pronunciation`, `definition`, `synonyms`, `antonyms`, `example`, `day`.
- `synonyms` and `antonyms` are lists — keep the square brackets `[ ]` and put each word in quote marks separated by commas.
- `day` is a number (no quote marks). Words are grouped by day in the game.
- If you change the number of days, also update `game.config.js → totalDays`.

> **Tip:** Use a free online JSON validator (search "JSON validator online") to check for errors after editing.

---

## 2. How to change game settings

Open **`game.config.js`** in the project root. It has clear comments explaining each setting:

| Setting | What it does |
|---|---|
| `title` | Game title shown on screen |
| `subtitle` | Subtitle e.g. "Battle of Words" |
| `description` | Short text on the login screen |
| `totalDays` | Total number of days in the competition |
| `wordsPerDay` | Words per day (shown in UI only) |
| `xpPerCorrect` | XP earned for a correct quiz answer |
| `xpPerFlashcard` | XP earned for reviewing a flashcard |
| `startingLives` | Hearts players start each quiz with |
| `leaderboardSize` | How many players appear on the leaderboard |

After changing this file, save it and redeploy to Vercel.

---

## 3. Setting up for the first time (non-technical guide)

> **Before you start:** this takes about 45–60 minutes the first time. After that, updating word lists or settings takes about 5 minutes.

### Step 1 — Install the tools you need

You need three free tools on your computer.

**A. Node.js** (runs the app on your computer for testing)
1. Go to [https://nodejs.org](https://nodejs.org)
2. Click the big green **"LTS"** download button (LTS = Long Term Support, the stable version).
3. Run the installer and click through all the defaults.
4. To verify: open a Terminal (Mac) or Command Prompt (Windows) and type `node --version`. You should see a version number like `v20.x.x`.

**B. Git** (downloads the code and tracks your changes)
1. Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Download for your operating system and run the installer with all defaults.
3. To verify: in Terminal/Command Prompt type `git --version`. You should see a version number.

**C. A code editor** (strongly recommended for editing files)
1. Go to [https://code.visualstudio.com](https://code.visualstudio.com)
2. Download and install VS Code. It's free and makes editing `words.json` much easier — it highlights errors as you type.

---

### Step 2 — Get the code onto your computer

**A. Create a GitHub account** (free)
1. Go to [https://github.com](https://github.com) and sign up.

**B. Fork the repository** (make your own copy of the code)
1. Go to the Word Quest repository page on GitHub.
2. Click the **"Fork"** button in the top-right corner.
3. Click **"Create fork"**. You now have your own copy under your GitHub account.

**C. Clone your fork** (download the code to your computer)
1. On your forked repository page, click the green **"Code"** button.
2. Copy the HTTPS URL (it looks like `https://github.com/YOUR-USERNAME/wordquest-app.git`).
3. Open Terminal (Mac) or Command Prompt (Windows).
4. Navigate to where you want to keep the project:
   ```
   cd Desktop
   ```
5. Run:
   ```
   git clone https://github.com/YOUR-USERNAME/wordquest-app.git
   ```
6. Enter the folder:
   ```
   cd wordquest-app
   ```

**D. Install the app's dependencies**
```
npm install
```
This downloads all the code libraries the app needs. It may take 1–2 minutes.

---

### Step 3 — Customise the word list

1. In VS Code, open the `wordquest-app` folder.
2. Find and open **`words.json`**.
3. Replace the words with your competition's word list following the format in [Section 1](#1-how-to-customise-the-word-list).
4. Open **`game.config.js`** and update the title, description, and `totalDays` to match your competition.
5. Save both files.

---

### Step 4 — Run it locally to test

This lets you see the app on your own computer before putting it online.

1. In Terminal/Command Prompt (inside the `wordquest-app` folder), run:
   ```
   npm run dev
   ```
2. Open your browser and go to: **http://localhost:3000**
3. You should see the Word Quest login screen.
4. Create a test profile and play through a day's words to make sure everything looks right.

> **Note:** When running locally without the KV database set up, player scores are stored in memory and will reset when you stop the server. That's expected — the KV setup in Steps 6–7 fixes this.

To stop the local server, press **Ctrl+C** in the Terminal.

---

### Step 5 — Put it on the internet (Vercel)

Vercel is a free hosting service that deploys your app in minutes.

**A. Create a Vercel account**
1. Go to [https://vercel.com](https://vercel.com) and click **"Sign Up"**.
2. Choose **"Continue with GitHub"** — this links your Vercel and GitHub accounts.

**B. Import your project**
1. On the Vercel dashboard, click **"Add New…"** → **"Project"**.
2. Find `wordquest-app` in your repository list and click **"Import"**.
3. On the configuration screen:
   - **Framework Preset:** should auto-detect as **Next.js**. If not, select it.
   - Leave everything else as default.
4. Click **"Deploy"**.
5. Wait about 2 minutes. When complete, you'll see a URL like `wordquest-app-abc123.vercel.app`.
6. Click **"Visit"** to see your live app!

> At this point the app works but scores won't persist after server restarts. Complete Steps 6–7 to fix this.

---

### Step 6 — Add a database so scores are saved (Vercel KV)

Vercel KV is a free database service built into Vercel. It stores player profiles, scores, and progress permanently.

1. In the Vercel dashboard, click on your **wordquest-app** project.
2. Click the **"Storage"** tab.
3. Click **"Create Database"**.
4. Choose **"KV"** (Key-Value store).
5. Name it `wordquest-kv` and choose the region closest to you.
6. Click **"Create"**.
7. On the KV database page, click **"Connect to Project"** and select your wordquest-app project.

---

### Step 7 — Add the secret database keys to your app

The app needs secret keys to connect to the database.

**In Vercel (for the live app):**
1. Go to your wordquest-app project in Vercel.
2. Click **"Settings"** → **"Environment Variables"**.
3. You should already see `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `KV_REST_API_READ_ONLY_TOKEN` — Vercel adds these automatically when you connect the KV database.
4. If they're missing: go to your KV database → **".env.local"** tab → copy each key and add them manually under Settings → Environment Variables.

**On your computer (for local testing with the real database):**
1. On the KV database page, click the **".env.local"** tab.
2. Click **"Copy Snippet"**.
3. Create a file called `.env.local` in the `wordquest-app` folder on your computer.
4. Paste the snippet in and save.

> ⚠️ **Important:** `.env.local` contains secret keys. Never share it, never upload it to GitHub. It is already in `.gitignore` so Git automatically ignores it.

---

### Step 8 — Redeploy and verify

After any changes (words, config, environment variables), you need to redeploy.

**Option A — Push to GitHub (recommended):**
```bash
git add .
git commit -m "Update word list"
git push
```
Vercel automatically detects the push and redeploys in about 2 minutes.

**Option B — Vercel dashboard:**
1. Go to your project → **"Deployments"** tab.
2. Click **"…"** next to the latest deployment → **"Redeploy"**.

**Verifying everything works:**
1. Visit your Vercel app URL.
2. Create a player profile.
3. Play through Day 1.
4. Reload the page and check the Leaderboard.
5. ✅ If the score is still there after reload, the database is working correctly.

---

## 4. Sharing the app with students

1. Share the Vercel URL (e.g. `wordquest-app-abc123.vercel.app`) with students.
2. Each student creates their own profile with a name, avatar, and 4-digit PIN on first visit.
3. Students use their PIN to log in on subsequent visits — on any device.
4. The leaderboard is visible to all players so they can see rankings in real time.

**Tips:**
- Encourage students to complete one day's words per day — the streak counter rewards daily practice.
- The "Review" section lets students revisit words from completed days.
- Players can use the app from home, school, or on their phone.

---

## 5. Resetting scores between competitions

To clear all player data and start fresh:

1. Go to Vercel dashboard → **Storage** → your KV database.
2. Click the **"Data Browser"** tab.
3. You can delete individual player keys, or use the CLI to flush all data.

> ⚠️ **This is permanent.** All player profiles, scores, and progress will be deleted. Make sure you want to do this first.

To keep the old data as a backup, create a new KV database and connect it to the project instead.

---

## 6. Troubleshooting

**The app shows "Loading Word Quest…" forever**
- Check the browser console for errors (press F12 → Console tab).
- Make sure you ran `npm install` before `npm run dev`.

**"words.json: missing field" errors in the console**
- Open `words.json` and check that every entry has all 7 required fields.
- Use an online JSON validator to check for syntax errors.

**Scores aren't saving after page reload**
- The Vercel KV database isn't connected. Complete Steps 6–7.
- Check that `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set in Vercel → Settings → Environment Variables.

**"Internal Server Error" on login or signup**
- Vercel dashboard → your project → **"Functions"** tab for error logs.
- Most commonly caused by missing environment variables.

**A player forgot their PIN**
- PINs are stored securely (hashed) and cannot be recovered.
- Delete the player's entry from the KV Data Browser and have them create a new profile.

**The app looks broken on mobile**
- Try clearing the browser cache on the device (Settings → browser → Clear history).
- Make sure you're using the latest version (pull from GitHub and redeploy).

**I edited words.json but the changes aren't showing**
- You need to push to GitHub and redeploy after every change. See [Step 8](#step-8--redeploy-and-verify).

---

## 7. Project structure (for developers)

```
wordquest-app/
├── words.json          ← ✏️  Edit this to change the word list
├── game.config.js      ← ✏️  Edit this to change game settings
├── app/
│   ├── page.jsx        ← Login / profile selection screen
│   ├── layout.jsx      ← HTML wrapper and viewport settings
│   ├── globals.css     ← All shared styles
│   └── api/
│       ├── users/      ← POST: create user  GET: list users
│       └── auth/
│           └── verify-pin/ ← POST: verify 4-digit PIN
├── components/
│   └── Game.jsx        ← Main game component (flashcards, quiz, leaderboard)
├── lib/
│   ├── words.js        ← Loads and validates words.json
│   └── kv.js           ← Vercel KV / in-memory database abstraction
└── .env.local          ← 🔒 Secret keys (never commit this file)
```

**Tech stack:** Next.js 14 (App Router) · React · Vercel KV (Upstash Redis) · bcryptjs for PIN hashing

**Environment variables required in production:**

| Variable | Where to get it |
|---|---|
| `KV_REST_API_URL` | Vercel KV dashboard → .env.local tab |
| `KV_REST_API_TOKEN` | Vercel KV dashboard → .env.local tab |
| `KV_REST_API_READ_ONLY_TOKEN` | Vercel KV dashboard → .env.local tab |

In development, the app automatically falls back to in-memory storage if these are not set.

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.
