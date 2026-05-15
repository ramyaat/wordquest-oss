/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║              WORD QUEST — GAME CONFIGURATION             ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Edit this file to customise the game for your school / competition.
 * No coding knowledge needed — just change the values below and redeploy.
 *
 * After changing anything here, redeploy to Vercel for the changes to go live.
 * (In the Vercel dashboard click "Deployments" → "Redeploy", or push to GitHub.)
 */

const gameConfig = {
  // ── Branding ─────────────────────────────────────────────────────────────
  /** Title shown on the home screen and browser tab */
  title: 'Word Quest',

  /** Subtitle shown under the title */
  subtitle: 'Battle of Words',

  /** Short description shown on the profile/login screen */
  description: 'Grade 7 · 200 Words · 20 Days',

  // ── Word List ─────────────────────────────────────────────────────────────
  /**
   * Total number of days in the competition.
   * Must match the highest "day" value used in words.json.
   * Example: if your words.json has days 1–20, set this to 20.
   */
  totalDays: 20,

  /**
   * How many words appear per day.
   * This is purely informational (shown in the UI).
   * The actual grouping is controlled by the "day" field in words.json.
   */
  wordsPerDay: 10,

  // ── XP & Scoring ─────────────────────────────────────────────────────────
  /** XP awarded for a correct answer in quiz/multiple-choice mode */
  xpPerCorrect: 10,

  /** XP awarded when the user marks a flashcard as "Got it!" */
  xpPerFlashcard: 5,

  /** XP deducted for a wrong answer (set to 0 to disable penalties) */
  xpPenaltyWrong: 0,

  // ── Lives ─────────────────────────────────────────────────────────────────
  /** Number of lives (hearts) a player starts each quiz session with */
  startingLives: 3,

  // ── Leaderboard ──────────────────────────────────────────────────────────
  /** Maximum number of players shown on the leaderboard */
  leaderboardSize: 10,
}

export default gameConfig
