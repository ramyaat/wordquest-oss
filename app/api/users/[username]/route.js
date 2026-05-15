import { NextResponse } from 'next/server'
import { db } from '@/lib/kv'

export async function GET(req, { params }) {
  try {
    const { username } = params
    const profile = await db.get('user:' + username)
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ profile })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
