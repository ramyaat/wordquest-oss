'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const POLL_INTERVAL = 5000 // refresh every 5 seconds

export default function Leaderboard() {
  const router = useRouter()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [flash, setFlash] = useState({}) // {username: true} for XP-gain highlight
  const prevEntries = useRef([])
  const pollRef = useRef(null)
  const tickRef = useRef(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' })
      const data = await res.json()
      const fresh = data.entries || []

      // Detect XP gains and flash those rows
      const gained = {}
      fresh.forEach(e => {
        const old = prevEntries.current.find(x => x.username === e.username)
        if (old && e.totalXP > old.totalXP) gained[e.username] = true
      })
      if (Object.keys(gained).length > 0) {
        setFlash(gained)
        setTimeout(() => setFlash({}), 1500)
      }

      prevEntries.current = fresh
      setEntries(fresh)
      setLastUpdated(Date.now())
      setSecondsAgo(0)
    } catch (e) {
      // silently ignore network errors between polls
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const u = sessionStorage.getItem('wq_user')
    setMe(u)
    fetchLeaderboard()

    // Poll every 5 seconds
    pollRef.current = setInterval(fetchLeaderboard, POLL_INTERVAL)

    // Tick "X seconds ago" every second
    tickRef.current = setInterval(() => {
      setSecondsAgo(s => s + 1)
    }, 1000)

    return () => {
      clearInterval(pollRef.current)
      clearInterval(tickRef.current)
    }
  }, [fetchLeaderboard])

  const myRank = entries.findIndex(e => e.username === me) + 1
  const myEntry = entries.find(e => e.username === me)
  const above = myRank > 1 ? entries[myRank - 2] : null
  const maxXP = entries[0]?.totalXP || 1

  function rankIcon(rank) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  function XPBar({ xp }) {
    const pct = Math.min(100, (xp / maxXP) * 100)
    return (
      <div style={{ background: '#e8e8e8', borderRadius: '99px', height: '6px', width: '80px', overflow: 'hidden', display: 'inline-block', verticalAlign: 'middle', marginLeft: '8px' }}>
        <div style={{ background: 'var(--green)', height: '100%', borderRadius: '99px', width: `${pct}%`, transition: 'width .6s ease' }} />
      </div>
    )
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⏳</div>
        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>Loading leaderboard...</div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,.08)', marginBottom: '18px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => me ? router.push('/game') : router.push('/')}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontWeight: 800, color: 'var(--navy)' }}>🏆 Leaderboard</div>
          {/* LIVE indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#e8fff0', border: '1.5px solid var(--green)', borderRadius: '99px', padding: '3px 10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'livePulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#2d8c00' }}>LIVE</span>
          </div>
        </div>
        <div style={{ fontSize: '.75rem', color: '#aaa' }}>
          {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
        </div>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .4; transform: scale(.8); }
        }
        @keyframes xpFlash {
          0% { background: #fff; }
          30% { background: #fffde7; border-color: #FFD700; }
          100% { background: #fff; }
        }
        .lb-row.flashing { animation: xpFlash 1.5s ease forwards; }
      `}</style>

      {/* Podium (top 3) */}
      {entries.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          {[entries[1], entries[0], entries[2]].map((e, col) => {
            const heights = [80, 110, 60]
            const colors = ['#C0C0C0', 'linear-gradient(135deg,#FFD700,#ffaa00)', '#CD7F32']
            const realRank = [2, 1, 3][col]
            return (
              <div key={e.username} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: col === 1 ? '2.4rem' : '2rem', marginBottom: '4px', transition: 'all .3s' }}>{e.avatar}</div>
                <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--navy)', marginBottom: '4px', wordBreak: 'break-word' }}>
                  {e.username}{e.username === me ? ' 👈' : ''}
                </div>
                <div style={{ background: colors[col], borderRadius: '12px 12px 0 0', padding: '10px 8px', height: `${heights[col]}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', transition: 'height .5s ease' }}>
                  <div style={{ fontSize: col === 1 ? '1.8rem' : '1.4rem' }}>{rankIcon(realRank)}</div>
                  <div style={{ fontWeight: 800, color: col === 1 ? '#7a5c00' : '#fff', fontSize: '.88rem' }}>{e.totalXP} XP</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* My rank card */}
      {me && myEntry && (
        <div style={{ background: 'linear-gradient(135deg,var(--navy),#2e6aad)', color: '#fff', borderRadius: '16px', padding: '16px 20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, width: '40px', textAlign: 'center' }}>
            {myRank <= 3 ? rankIcon(myRank) : `#${myRank}`}
          </div>
          <div style={{ fontSize: '2rem' }}>{myEntry.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800 }}>You · {myEntry.username}</div>
            <div style={{ fontSize: '.8rem', opacity: .8 }}>
              Day {Math.max(1, myEntry.currentDay - 1)}/20 · {myEntry.daysCompleted} days · 🔥 {myEntry.streak}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{myEntry.totalXP}</div>
            <div style={{ fontSize: '.72rem', opacity: .7 }}>Total XP</div>
          </div>
        </div>
      )}

      {/* Motivation messages */}
      {above && myEntry && (
        <div style={{ background: '#fff8e1', border: '2px solid #FFD700', borderRadius: '14px', padding: '11px 16px', marginBottom: '12px', textAlign: 'center', fontSize: '.92rem', fontWeight: 600, color: '#856404' }}>
          ⚡ Only <strong>{above.totalXP - myEntry.totalXP + 1} more XP</strong> to overtake <strong>{above.username}</strong>!
        </div>
      )}
      {myRank === 1 && myEntry && myEntry.totalXP > 0 && (
        <div style={{ background: '#e8fff0', border: '2px solid var(--green)', borderRadius: '14px', padding: '11px 16px', marginBottom: '12px', textAlign: 'center', fontSize: '.92rem', fontWeight: 600, color: '#2d8c00' }}>
          🏆 You are leading the class! Keep it up!
        </div>
      )}

      {/* Full list */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontWeight: 800, color: 'var(--navy)' }}>📋 All Players</div>
          <div style={{ fontSize: '.76rem', color: '#777', background: '#f0f4ff', padding: '4px 10px', borderRadius: '99px' }}>
            Total XP · updates every 5s
          </div>
        </div>

        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777', padding: '20px' }}>
            No players yet. Create a profile to appear here!
          </p>
        ) : (
          entries.map((e, i) => (
            <div key={e.username}
              className={`lb-row${e.username === me ? ' me' : ''}${flash[e.username] ? ' flashing' : ''}`}
              style={{ transition: 'background .4s' }}>
              <div className="lb-rank" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#777', fontWeight: 800 }}>
                {i < 3 ? rankIcon(i + 1) : `#${i + 1}`}
              </div>
              <div className="lb-avatar">{e.avatar}</div>
              <div className="lb-name">
                <div style={{ fontWeight: e.username === me ? 800 : 600 }}>
                  {e.username}{e.username === me ? ' (you)' : ''}
                  {flash[e.username] && <span style={{ fontSize: '.75rem', color: 'var(--green)', marginLeft: '6px', fontWeight: 700 }}>+XP ⬆</span>}
                </div>
                <div style={{ fontSize: '.73rem', color: '#999' }}>
                  Day {Math.max(1, e.currentDay - 1)}/20 · {e.daysCompleted} done · 🔥{e.streak}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div className="lb-xp" style={{ fontWeight: 800 }}>{e.totalXP} XP</div>
                <XPBar xp={e.totalXP} />
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '14px', color: '#bbb', fontSize: '.76rem' }}>
        Rankings update automatically every 5 seconds
      </div>

      {me && (
        <button className="btn btn-green btn-full" style={{ marginTop: '14px' }} onClick={() => router.push('/game')}>
          🎯 Back to Game
        </button>
      )}
    </div>
  )
}
