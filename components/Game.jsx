'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { WORDS } from '@/lib/words'

// ─── helpers ────────────────────────────────────────────────────────────────
const shuffle = a => [...a].sort(() => Math.random() - .5)
const wordsForDay = d => WORDS.filter(w => w.day === d)
const todayStr = () => new Date().toISOString().slice(0, 10)

function speak(word) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(word)
  u.rate = 0.82; u.pitch = 1.1
  speechSynthesis.speak(u)
}

let _audioCtx = null
function getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume()
  return _audioCtx
}

function playSound(type) {
  try {
    const ctx = getAudioCtx()
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    if (type === 'correct') {
      o.frequency.setValueAtTime(523, ctx.currentTime)
      o.frequency.setValueAtTime(784, ctx.currentTime + .1)
      g.gain.setValueAtTime(.22, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .45)
      o.start(); o.stop(ctx.currentTime + .45)
    } else if (type === 'wrong') {
      o.frequency.setValueAtTime(180, ctx.currentTime)
      g.gain.setValueAtTime(.18, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .35)
      o.start(); o.stop(ctx.currentTime + .35)
    } else if (type === 'complete') {
      ;[523, 659, 784, 1047].forEach((f, i) => {
        const o2 = ctx.createOscillator(), g2 = ctx.createGain()
        o2.connect(g2); g2.connect(ctx.destination)
        o2.frequency.value = f
        g2.gain.setValueAtTime(.18, ctx.currentTime + i * .12)
        g2.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + i * .12 + .3)
        o2.start(ctx.currentTime + i * .12); o2.stop(ctx.currentTime + i * .12 + .35)
      })
    }
  } catch (e) {}
}

function confetti() {
  if (typeof document === 'undefined') return
  const cols = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8']
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    const sz = 6 + Math.random() * 8
    el.style.cssText = `left:${Math.random() * 100}vw;width:${sz}px;height:${sz}px;` +
      `background:${cols[i % cols.length]};animation-duration:${1.5 + Math.random() * 1.5}s;` +
      `animation-delay:${Math.random() * .4}s`
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 3500)
  }
}

function toast(msg) {
  if (typeof document === 'undefined') return
  const t = document.createElement('div')
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
    'background:#333;color:#fff;padding:12px 24px;border-radius:99px;font-weight:700;' +
    'z-index:9999;font-size:.95rem;white-space:nowrap;animation:fadeIn .3s'
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => { t.style.transition = 'opacity .5s'; t.style.opacity = '0' }, 2200)
  setTimeout(() => t.remove(), 2800)
}

function calcStars(errors, total) {
  const p = 1 - errors / Math.max(1, total)
  return p >= .9 ? 3 : p >= .7 ? 2 : 1
}

function buildQuizQueue(words) {
  const q = []
  words.forEach(w => {
    q.push({ type: 'def', word: w })
    q.push({ type: 'syn', word: w })
    q.push({ type: 'fill', word: w })
  })
  return shuffle(q)
}

function buildQuestion(qItem, lessonWords) {
  const w = qItem.word
  const others = lessonWords.filter(x => x !== w)
  if (qItem.type === 'def') {
    const choices = shuffle([w.d, ...shuffle(others.map(x => x.d)).slice(0, 3)])
    return { label: '📖 What does this word mean?', question: w.w, subq: w.p, choices, answer: w.d }
  } else if (qItem.type === 'syn') {
    const correct = w.syn[Math.floor(Math.random() * w.syn.length)]
    const wrongs = shuffle(others.flatMap(x => x.syn).filter(s => !w.syn.includes(s))).slice(0, 3)
    const choices = shuffle([correct, ...wrongs])
    return { label: '🔗 Choose a SYNONYM for:', question: w.w, subq: null, choices, answer: correct }
  } else {
    const sentence = w.s.replace(new RegExp(w.w, 'i'), '_______')
    const choices = shuffle([w.w, ...shuffle(others.map(x => x.w)).slice(0, 3)])
    return { label: '✏️ Fill in the blank:', question: sentence, subq: null, choices, answer: w.w }
  }
}

function checkAchievements(gs, grant) {
  const mastered = Object.values(gs.completedDays).reduce((a, d) => a + (d.mastered || []).length, 0)
  const days = Object.keys(gs.completedDays).length
  if (mastered >= 1)   grant('first', '🌟 First Word!')
  if (mastered >= 10)  grant('ten', '📚 Word Collector')
  if (mastered >= 50)  grant('fifty', '🏗️ Vocab Builder')
  if (mastered >= 100) grant('hundred', '💯 Century Club')
  if (mastered >= 200) grant('all', '🏆 Word Champion')
  if (days >= 1)       grant('day1', '🎒 First Day Done')
  if (days >= 5)       grant('five', '🌊 5 Days Strong')
  if (days >= 10)      grant('ten_d', '🎓 10 Days Done')
  if (days >= 20)      grant('done', '⚔️ Battle Ready')
  if (gs.streak >= 3)  grant('s3', '🔥 3-Day Streak')
  if (gs.streak >= 7)  grant('s7', '⚡ Weekly Warrior')
  const perfs = Object.values(gs.completedDays).filter(d => d.stars === 3).length
  if (perfs >= 1)      grant('perf', '⭐ Perfectionist')
  if (gs.totalXP >= 1000) grant('xp1k', '💰 1000 XP')
}

const ALL_BADGES = [
  { id: 'first',   icon: '🌟', name: 'First Word!',      desc: 'Learn your first word' },
  { id: 'ten',     icon: '📚', name: 'Word Collector',   desc: 'Master 10 words' },
  { id: 'fifty',   icon: '🏗️', name: 'Vocab Builder',    desc: 'Master 50 words' },
  { id: 'hundred', icon: '💯', name: 'Century Club',     desc: 'Master 100 words' },
  { id: 'all',     icon: '🏆', name: 'Word Champion',    desc: 'Master all 200 words' },
  { id: 'day1',    icon: '🎒', name: 'First Day',        desc: 'Complete Day 1' },
  { id: 'five',    icon: '🌊', name: '5 Days Strong',    desc: 'Complete 5 days' },
  { id: 'ten_d',   icon: '🎓', name: '10 Days Done',     desc: 'Complete 10 days' },
  { id: 'done',    icon: '⚔️', name: 'Battle Ready',     desc: 'Complete all 20 days' },
  { id: 's3',      icon: '🔥', name: 'On Fire',          desc: '3-day streak' },
  { id: 's7',      icon: '⚡', name: 'Weekly Warrior',   desc: '7-day streak' },
  { id: 'perf',    icon: '⭐', name: 'Perfectionist',    desc: 'Get 3 stars on any day' },
  { id: 'xp1k',   icon: '💰', name: 'XP Maniac',        desc: 'Earn 1000 XP' },
]

// ─── main component ─────────────────────────────────────────────────────────
export default function Game() {
  const router = useRouter()
  const [username, setUsername] = useState(null)
  const [avatar, setAvatar] = useState('🎓')
  const [gs, setGs] = useState(null)          // game state (loaded from server)
  const [screen, setScreen] = useState('home')
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  // Session vars (not saved to server)
  const [lessonWords, setLessonWords] = useState([])
  const [lessonDay, setLessonDay] = useState(1)
  const [lessonPhase, setLessonPhase] = useState('learn')
  const [lessonIdx, setLessonIdx] = useState(0)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [quizQueue, setQuizQueue] = useState([])
  const [quizQIdx, setQuizQIdx] = useState(0)
  const [quizQ, setQuizQ] = useState(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [hearts, setHearts] = useState(5)
  const [sessionXP, setSessionXP] = useState(0)
  const [sessionErrors, setSessionErrors] = useState(0)
  const [reviewOpen, setReviewOpen] = useState(null)
  const [completionData, setCompletionData] = useState(null)

  // Load user from sessionStorage, then fetch progress
  useEffect(() => {
    const u = sessionStorage.getItem('wq_user')
    if (!u) { router.push('/'); return }
    setUsername(u)
    fetch('/api/users').then(r => r.json()).then(d => {
      const profile = (d.users || []).find(x => x.username === u)
      if (profile) setAvatar(profile.avatar || '🎓')
    })
    fetch(`/api/progress/${encodeURIComponent(u)}`).then(r => r.json()).then(d => {
      if (d.progress) setGs(d.progress)
      else setGs({ currentDay: 1, totalXP: 0, streak: 0, lastDate: null, completedDays: {}, achievements: [] })
      setLoading(false)
    }).catch(() => {
      setGs({ currentDay: 1, totalXP: 0, streak: 0, lastDate: null, completedDays: {}, achievements: [] })
      setLoading(false)
    })
  }, [router])

  // Debounced save to server
  const saveToServer = useCallback((newGs) => {
    if (!username) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch(`/api/progress/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGs)
      }).then(r => r.json()).then(d => {
        if (d.progress) setGs(d.progress)
      }).catch(() => {})
    }, 800)
  }, [username])

  function updateGs(changes) {
    setGs(prev => {
      const next = { ...prev, ...changes }
      saveToServer(next)
      return next
    })
  }

  function makeGranter(currentGs, onUpdate) {
    const granted = new Set(currentGs.achievements || [])
    return function grant(id, name) {
      if (granted.has(id)) return
      granted.add(id)
      toast(`🏅 Achievement: ${name}`)
      onUpdate([...granted])
    }
  }

  function startDay(d) {
    if (!gs || d > gs.currentDay) { toast('🔒 Complete previous days first!'); return }
    const words = shuffle(wordsForDay(d))
    const queue = buildQuizQueue(words)
    setLessonDay(d); setLessonWords(words); setQuizQueue(queue)
    setLessonPhase('learn'); setLessonIdx(0); setCardFlipped(false)
    setQuizQIdx(0); setQuizQ(null); setQuizAnswered(false)
    setHearts(5); setSessionXP(0); setSessionErrors(0)
    setScreen('lesson')
  }

  function finishLearn() {
    setLessonPhase('quiz'); setLessonIdx(0); setQuizQIdx(0)
  }

  function answerQuiz(idx) {
    if (quizAnswered) return
    const q = quizQ || buildQuestion(quizQueue[quizQIdx], lessonWords)
    if (!quizQ) setQuizQ(q)
    const correct = q.choices[idx] === q.answer
    setSelectedIdx(idx); setQuizAnswered(true); setLastCorrect(correct)
    if (correct) {
      playSound('correct')
      const xp = 10
      setSessionXP(p => p + xp)
      updateGs({ totalXP: (gs.totalXP || 0) + xp })
    } else {
      playSound('wrong')
      setHearts(p => Math.max(0, p - 1))
      setSessionErrors(p => p + 1)
    }
  }

  function nextQuiz() {
    const nextIdx = quizQIdx + 1
    if (nextIdx >= quizQueue.length) {
      finishDay()
    } else {
      setQuizQIdx(nextIdx)
      setQuizQ(buildQuestion(quizQueue[nextIdx], lessonWords))
      setQuizAnswered(false); setSelectedIdx(-1)
    }
  }

  function finishDay() {
    const stars = calcStars(sessionErrors, quizQueue.length)
    const bonus = stars * 50
    const newCompletedDays = {
      ...gs.completedDays,
      [lessonDay]: { stars, xp: sessionXP + bonus, mastered: lessonWords.map(w => w.w) }
    }
    const newCurrentDay = lessonDay === gs.currentDay ? Math.min(20, lessonDay + 1) : gs.currentDay
    const today = todayStr()
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    let newStreak = gs.streak || 0
    if (gs.lastDate !== today) {
      newStreak = gs.lastDate === yest ? newStreak + 1 : 1
    }
    const totalBonus = bonus
    const newTotalXP = (gs.totalXP || 0) + totalBonus
    let newGs = { ...gs, completedDays: newCompletedDays, currentDay: newCurrentDay, streak: newStreak, lastDate: today, totalXP: newTotalXP }
    const grant = makeGranter(newGs, (achievements) => {
      newGs = { ...newGs, achievements }
    })
    checkAchievements(newGs, grant)
    setGs(newGs)
    // Cancel any pending debounced save so it doesn't overwrite achievements
    clearTimeout(saveTimer.current)
    fetch(`/api/progress/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGs),
    }).catch(() => {})
    confetti(); playSound('complete')
    setCompletionData({ day: lessonDay, stars, xp: sessionXP + bonus })
    setScreen('complete')
  }

  if (loading || !gs) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Loading your progress...</div>
        </div>
      </div>
    )
  }

  const level = Math.floor((gs.totalXP || 0) / 500) + 1
  const levelXP = (gs.totalXP || 0) % 500

  // ── HEADER (shared) ───────────────────────────────────────────────────────
  function Header({ title, back, backLabel = '← Home' }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,.08)', marginBottom: '18px' }}>
        <button className="btn btn-ghost btn-sm" onClick={back || (() => setScreen('home'))}>{backLabel}</button>
        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{title}</div>
        <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '.9rem' }}>⭐ {gs.totalXP}</div>
      </div>
    )
  }

  // ── HOME SCREEN ───────────────────────────────────────────────────────────
  if (screen === 'home') {
    const mastered = Object.values(gs.completedDays || {}).reduce((a, d) => a + (d.mastered || []).length, 0)
    const doneCount = Object.keys(gs.completedDays || {}).length
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }} className="screen">
        {/* Top bar */}
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,.08)', marginBottom: '18px', padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>{avatar}</span>
              <span style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '.95rem' }}>{username}</span>
            </div>
            <span className="level-badge">Lvl {level}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '.88rem', fontWeight: 700, color: '#555' }}>
            <span>🔥 {gs.streak} streak</span>
            <span>⭐ {gs.totalXP} XP</span>
          </div>
        </div>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg,#1f4068,#2e6aad)', color: '#fff', borderRadius: '20px', padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🏆 Battle of Words</div>
          <p style={{ opacity: .8, fontSize: '.95rem' }}>Grade 7 · 200 words · 20 days</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px' }}>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{mastered}</div><div style={{ fontSize: '.75rem', opacity: .8 }}>Mastered</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{doneCount}/20</div><div style={{ fontSize: '.75rem', opacity: .8 }}>Days Done</div></div>
            <div><div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{gs.streak}🔥</div><div style={{ fontSize: '.75rem', opacity: .8 }}>Streak</div></div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '.75rem', opacity: .7 }}>Level {level} · {levelXP}/500 XP</div>
          <div className="xp-bar-wrap" style={{ marginTop: '6px' }}><div className="xp-bar" style={{ width: `${levelXP / 5}%` }} /></div>
        </div>

        {/* Day grid */}
        <div className="card">
          <div style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '14px' }}>📅 20-Day Journey</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
            {Array.from({ length: 20 }, (_, i) => {
              const d = i + 1
              const done = gs.completedDays?.[d]
              const isNext = d === gs.currentDay
              const locked = d > gs.currentDay
              return (
                <div key={d} onClick={() => startDay(d)}
                  className={`day-tile ${done ? 'day-done' : isNext ? 'day-active' : 'day-locked'}`}>
                  <div>Day {d}</div>
                  <div style={{ fontSize: '.6rem' }}>{done ? '⭐'.repeat(done.stars || 0) : locked ? '🔒' : '📚'}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Nav grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '16px' }} onClick={() => setScreen('review')}>
            <div style={{ fontSize: '1.8rem' }}>📖</div>
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginTop: '4px' }}>Review</div>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '16px' }} onClick={() => router.push('/leaderboard')}>
            <div style={{ fontSize: '1.8rem' }}>🏆</div>
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginTop: '4px' }}>Leaderboard</div>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '16px' }} onClick={() => setScreen('achievements')}>
            <div style={{ fontSize: '1.8rem' }}>🏅</div>
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginTop: '4px' }}>Badges</div>
          </div>
        </div>

        <button className="btn btn-ghost btn-full" style={{ marginTop: '8px' }} onClick={() => { sessionStorage.removeItem('wq_user'); router.push('/') }}>
          Switch Player
        </button>
      </div>
    )
  }

  // ── LESSON SCREEN ─────────────────────────────────────────────────────────
  if (screen === 'lesson') {
    const prog = lessonPhase === 'learn'
      ? Math.round((lessonIdx / lessonWords.length) * 50)
      : 50 + Math.round((quizQIdx / Math.max(1, quizQueue.length)) * 50)

    // Learn phase
    if (lessonPhase === 'learn') {
      if (lessonIdx >= lessonWords.length) { finishLearn(); return null }
      const w = lessonWords[lessonIdx]
      return (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }} className="screen">
          <Header title={`Day ${lessonDay} · Learn`} />
          <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${prog}%` }} /></div>
          <p style={{ textAlign: 'center', fontSize: '.85rem', color: '#777', marginBottom: '14px' }}>
            Word {lessonIdx + 1} of {lessonWords.length} · Tap the card to flip
          </p>
          <div className="flashcard" onClick={() => setCardFlipped(f => !f)}>
            <div className={`flashcard-inner${cardFlipped ? ' flipped' : ''}`}>
              <div className="flashcard-front">
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{w.w}</div>
                <div style={{ color: '#aed6f1', fontStyle: 'italic', fontSize: '1rem', marginBottom: '12px' }}>{w.p}</div>
                <button onClick={e => { e.stopPropagation(); speak(w.w) }}
                  style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.4rem', cursor: 'pointer', color: '#fff' }}>🔊</button>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.85rem', marginTop: '16px' }}>Tap to reveal definition →</div>
              </div>
              <div className="flashcard-back">
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '2px' }}>
                  {w.w}
                  <button onClick={e => { e.stopPropagation(); speak(w.w) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginLeft: '6px' }}>🔊</button>
                </div>
                <div style={{ color: 'var(--blue)', fontStyle: 'italic', fontSize: '.88rem', marginBottom: '10px' }}>{w.p}</div>
                <p style={{ fontSize: '.93rem', lineHeight: '1.6', marginBottom: '10px' }}>{w.d}</p>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '.75rem', color: '#777' }}>SYNONYMS </strong>
                  {w.syn.map(s => <span key={s} className="tag tag-syn">{s}</span>)}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '.75rem', color: '#777' }}>ANTONYMS </strong>
                  {w.ant.map(a => <span key={a} className="tag tag-ant">{a}</span>)}
                </div>
                <div className="sentence-box">💬 {w.s}</div>
              </div>
            </div>
          </div>
          {cardFlipped ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <button className="btn btn-ghost" onClick={() => setCardFlipped(false)}>🔄 See Again</button>
              <button className="btn btn-green" onClick={() => {
                updateGs({ totalXP: (gs.totalXP || 0) + 5 })
                setSessionXP(p => p + 5)
                setLessonIdx(i => i + 1); setCardFlipped(false)
              }}>✓ Got it! +5 XP</button>
            </div>
          ) : (
            <button className="btn btn-blue btn-full" style={{ marginTop: '16px' }} onClick={() => setCardFlipped(true)}>
              Reveal Definition
            </button>
          )}
        </div>
      )
    }

    // Quiz phase
    const q = quizQ || (() => {
      const newQ = buildQuestion(quizQueue[quizQIdx], lessonWords)
      setQuizQ(newQ)
      return newQ
    })()

    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }} className="screen">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,.08)', marginBottom: '18px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setScreen('home')}>← Home</button>
          <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Day {lessonDay} · Practice</div>
          <div style={{ fontWeight: 700, color: 'var(--green)' }}>+{sessionXP} XP</div>
        </div>
        <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${prog}%` }} /></div>
        <div style={{ marginBottom: '12px' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`heart${i >= hearts ? ' lost' : ''}`}>{i < hearts ? '❤️' : '🖤'}</span>
          ))}
        </div>
        <div className="card">
          <div style={{ fontSize: '.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--blue)', marginBottom: '8px' }}>{q.label}</div>
          <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '18px', lineHeight: '1.5' }}>
            {q.subq ? (
              <><span style={{ fontSize: '1.4rem', color: 'var(--navy)' }}>{q.question}</span><br />
                <span style={{ color: 'var(--blue)', fontStyle: 'italic', fontSize: '.9rem' }}>{q.subq}</span></>
            ) : `"${q.question}"`}
          </div>
          {q.choices.map((c, i) => {
            let cls = 'choice'
            if (quizAnswered) {
              if (c === q.answer) cls += ' correct'
              else if (i === selectedIdx) cls += ' wrong'
              else cls += ' disabled'
            }
            return (
              <button key={i} className={cls} onClick={() => answerQuiz(i)}>{c}</button>
            )
          })}
          {quizAnswered && (
            <div className={`feedback-bar ${lastCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
              {lastCorrect ? '🎉 Correct! +10 XP' : `❌ Answer: ${q.answer}`}
            </div>
          )}
        </div>
        {quizAnswered && (
          <button className="btn btn-green btn-full" onClick={nextQuiz}>Continue →</button>
        )}
      </div>
    )
  }

  // ── COMPLETE SCREEN ───────────────────────────────────────────────────────
  if (screen === 'complete' && completionData) {
    const { day, stars, xp } = completionData
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <div className="card completion">
          <div style={{ fontSize: '5rem', marginBottom: '12px' }}>🏆</div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--navy)' }}>Day {day} Complete!</h2>
          <div style={{ fontSize: '2.2rem', letterSpacing: '8px', margin: '12px 0' }}>
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--green)', marginBottom: '8px' }}>+{xp} XP earned!</div>
          <p style={{ color: '#777', margin: '8px 0' }}>
            {stars === 3 ? 'Perfect! Outstanding! 🎉' : stars === 2 ? 'Great job! Nearly perfect! 👏' : 'Good effort! Keep practising! 💪'}
          </p>
          <div style={{ background: 'var(--bg)', borderRadius: '14px', padding: '16px', margin: '16px 0' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--navy)' }}>🔥 Streak: {gs.streak} days</div>
            <div style={{ fontWeight: 700, color: 'var(--green)' }}>⭐ Total XP: {gs.totalXP}</div>
          </div>
          <button className="btn btn-green btn-full" onClick={() => setScreen('home')}>🗺️ Back to Map</button>
          {stars < 3 && (
            <button className="btn btn-blue btn-full" style={{ marginTop: '10px' }} onClick={() => startDay(day)}>
              🔄 Try Again for 3 Stars
            </button>
          )}
          <button className="btn btn-ghost btn-full" style={{ marginTop: '10px' }} onClick={() => router.push('/leaderboard')}>
            📊 View Leaderboard
          </button>
        </div>
      </div>
    )
  }

  // ── REVIEW SCREEN ─────────────────────────────────────────────────────────
  if (screen === 'review') {
    const learned = new Set(Object.values(gs.completedDays || {}).flatMap(d => d.mastered || []))
    const lw = WORDS.filter(w => learned.has(w.w))
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }} className="screen">
        <Header title="📖 Word Review" />
        {lw.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
            <p style={{ color: '#777' }}>Complete Day 1 to start reviewing words!</p>
            <button className="btn btn-green" style={{ marginTop: '16px' }} onClick={() => startDay(1)}>Start Day 1</button>
          </div>
        ) : lw.map((w, i) => (
          <div key={w.w} className="review-item" onClick={() => setReviewOpen(reviewOpen === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy)' }}>{w.w}</span>
                <button onClick={e => { e.stopPropagation(); speak(w.w) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginLeft: '6px' }}>🔊</button>
                <div style={{ color: 'var(--blue)', fontStyle: 'italic', fontSize: '.83rem' }}>{w.p}</div>
                <div style={{ color: '#777', fontSize: '.88rem', marginTop: '2px' }}>{w.d.slice(0, 80)}{w.d.length > 80 ? '…' : ''}</div>
              </div>
              <span style={{ color: '#aaa' }}>{reviewOpen === i ? '▲' : '▼'}</span>
            </div>
            {reviewOpen === i && (
              <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <p style={{ fontSize: '.93rem', lineHeight: 1.6, marginBottom: '8px' }}>{w.d}</p>
                <div style={{ marginBottom: '6px' }}><strong style={{ fontSize: '.75rem', color: '#777' }}>SYNONYMS </strong>{w.syn.map(s => <span key={s} className="tag tag-syn">{s}</span>)}</div>
                <div style={{ marginBottom: '6px' }}><strong style={{ fontSize: '.75rem', color: '#777' }}>ANTONYMS </strong>{w.ant.map(a => <span key={a} className="tag tag-ant">{a}</span>)}</div>
                <div className="sentence-box">💬 {w.s}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ── ACHIEVEMENTS SCREEN ───────────────────────────────────────────────────
  if (screen === 'achievements') {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }} className="screen">
        <Header title="🏅 Achievements" />
        <div className="card">
          {ALL_BADGES.map(b => (
            <div key={b.id} className="badge-row" style={{ opacity: gs.achievements?.includes(b.id) ? 1 : .4 }}>
              <div style={{ fontSize: '2rem', width: '52px', textAlign: 'center' }}>{b.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{b.name} {gs.achievements?.includes(b.id) ? '✓' : ''}</div>
                <div style={{ fontSize: '.82rem', color: '#777' }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
