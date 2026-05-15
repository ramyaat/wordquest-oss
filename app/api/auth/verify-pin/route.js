import { NextResponse } from 'next/server'
import { db } from '@/lib/kv'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { username, pin } = await req.json()
    if (!username || !pin) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const profile = await db.get('user:' + username)
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!profile.pinHash) return NextResponse.json({ error: 'No PIN set for this account' }, { status: 400 })

    const ok = await bcrypt.compare(pin, profile.pinHash)
    if (!ok) return NextResponse.json({ error: 'Wrong PIN, try again' }, { status: 401 })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
