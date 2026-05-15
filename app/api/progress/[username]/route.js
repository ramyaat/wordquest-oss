import { NextResponse } from 'next/server'
import { db } from '@/lib/kv'

export async function GET(req, { params }) {
  try {
    const { username } = params
    const progress = await db.get('progress:' + username)
    if (!progress) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ progress })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { username } = params
    const body = await req.json()
    const existing = await db.get('progress:' + username)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = { ...existing, ...body }
    await db.set('progress:' + username, updated)
    return NextResponse.json({ progress: updated })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
