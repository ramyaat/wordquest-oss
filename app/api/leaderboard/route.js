import { NextResponse } from 'next/server'
import { db } from '@/lib/kv'

export const revalidate = 0 // always fresh, never cached

export async function GET() {
  try {
    const usernames = await db.smembers('users')
    const entries = await Promise.all(
      usernames.map(async u => {
        const [profile, progress] = await Promise.all([
          db.get('user:' + u),
          db.get('progress:' + u),
        ])
        return {
          username: u,
          avatar: profile?.avatar ?? '🎓',
          totalXP: progress?.totalXP ?? 0,
          currentDay: progress?.currentDay ?? 1,
          streak: progress?.streak ?? 0,
          daysCompleted: Object.keys(progress?.completedDays ?? {}).length,
        }
      })
    )
    // Sort by total XP, then days completed as tiebreaker
    entries.sort((a, b) => b.totalXP - a.totalXP || b.daysCompleted - a.daysCompleted)
    return NextResponse.json({ entries, updatedAt: Date.now() })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
