/**
 * Word list loader — reads from words.json in the project root.
 *
 * To customise the word list, edit words.json directly.
 * Each entry must have these fields:
 *   word         – the vocabulary word (string)
 *   pronunciation – phonetic guide e.g. "ab-uh-RAY-shun" (string)
 *   definition   – meaning of the word (string)
 *   synonyms     – array of 2–4 similar words  (string[])
 *   antonyms     – array of 2–4 opposite words (string[])
 *   example      – a sentence using the word   (string)
 *   day          – which day of the game this word belongs to (number, 1–N)
 *
 * The game groups words by "day" and shows one day's batch per session.
 * If you change the number of days, also update game.config.js → totalDays.
 */

import rawWords from '../words.json'

// Validate and map to the compact internal shape used by Game.jsx
function loadWords() {
  const errors = []
  const mapped = rawWords.map((entry, i) => {
    const required = ['word','pronunciation','definition','synonyms','antonyms','example','day']
    for (const key of required) {
      if (entry[key] == null) errors.push(`words.json entry #${i+1}: missing "${key}"`)
    }
    return {
      w:   entry.word,
      p:   entry.pronunciation,
      d:   entry.definition,
      syn: entry.synonyms,
      ant: entry.antonyms,
      s:   entry.example,
      day: entry.day,
    }
  })

  if (errors.length > 0) {
    console.error('[words.js] Validation errors in words.json:\n' + errors.join('\n'))
  }

  return mapped
}

export const WORDS = loadWords()
