import { NextResponse } from 'next/server'
import { db } from '@/lib/kv'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const usernames = await db.smembers('users')
    const profiles = await Promise.all(
      usernames.map(async u => {
        const p = await db.get('user:' + u)
        return p ? { username: p.username, avatar: p.avatar } : { username: u, avatar: '🎓' }
      })
    )
    return NextResponse.json({ users: profiles.sort((a, b) => a.username.localeCompare(b.username)) })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { username, avatar, pin } = await req.json()
    if (!username || username.trim().length < 2)
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    if (!pin || !/^\d{4}$/.test(pin))
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 })

    const clean = username.trim().slice(0, 30)
    const existing = await db.get('user:' + clean)
    if (existing) return NextResponse.json({ error: 'Name already taken, pick another' }, { status: 409 })

    const pinHash = await bcrypt.hash(pin, 10)
    const profile = { username: clean, avatar: avatar || '🎓', pinHash, createdAt: new Date().toISOString() }
    const progress = { currentDay: 1, totalXP: 0, streak: 0, lastDate: null, completedDays: {}, achievements: [] }
    await db.set('user:' + clean, profile)
    await db.set('progress:' + clean, progress)
    await db.sadd('users', clean)
    await db.zadd('leaderboard', { score: 0, member: clean })
    return NextResponse.json({ profile: { username: clean, avatar: profile.avatar } })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
