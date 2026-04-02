import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/UserModel';
import { requireAdminSession } from '@/lib/requireAdminSession';
import { emitAdminEvent } from '@/lib/eventBus';

// GET: List personalization info (lightweight). Later: add pagination & filters via query.
export async function GET() {
  await dbConnect();
  await requireAdminSession();
  const users = await User.find({}, 'name email personalization').lean();
  return NextResponse.json(users.map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    personalization: u.personalization || { segments: [], scores: {}, tags: [], lastUpdated: null, history: [] },
  })));
}

/*
PUT body contract (action-based):
{
  userId: string;
  action: 'setSegments' | 'addTag' | 'removeTag' | 'setScore' | 'bulkUpdate' | 'replaceAll';
  segments?: string[]; // setSegments / replaceAll / bulkUpdate
  tag?: string;        // addTag / removeTag
  scoreKey?: string;   // setScore / bulkUpdate
  scoreValue?: number; // setScore
  scores?: Record<string, number>; // bulkUpdate / replaceAll
  tags?: string[];     // replaceAll / bulkUpdate
}
*/
export async function PUT(req: NextRequest) {
  await dbConnect();
  await requireAdminSession();
  try {
    const body = await req.json();
    const { userId, action } = body || {};
    if (!userId || !action) return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    const user: any = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.personalization = user.personalization || { segments: [], scores: {}, tags: [], history: [] };
    const p = user.personalization;
    let changed = false;
    const historyEntry = (change: string) => {
      p.history = p.history || [];
      p.history.push({ date: new Date(), change, segments: p.segments?.slice(0, 12), tags: p.tags?.slice(0, 12) });
      p.lastUpdated = new Date();
    };

    switch (action) {
      case 'setSegments': {
        if (!Array.isArray(body.segments)) return NextResponse.json({ error: 'segments array required' }, { status: 400 });
        p.segments = body.segments.map((s: string) => s.trim()).filter(Boolean);
        historyEntry('segments set');
        changed = true;
        break;
      }
      case 'addTag': {
        const tag = (body.tag || '').trim();
        if (!tag) return NextResponse.json({ error: 'tag required' }, { status: 400 });
        p.tags = p.tags || [];
        if (!p.tags.includes(tag)) { p.tags.push(tag); changed = true; historyEntry(`tag added: ${tag}`); }
        break;
      }
      case 'removeTag': {
        const tag = (body.tag || '').trim();
        if (!tag) return NextResponse.json({ error: 'tag required' }, { status: 400 });
        const before = p.tags?.length || 0;
        p.tags = (p.tags || []).filter((t: string) => t !== tag);
        if (p.tags.length !== before) { changed = true; historyEntry(`tag removed: ${tag}`); }
        break;
      }
      case 'setScore': {
        const { scoreKey, scoreValue } = body;
        if (!scoreKey || typeof scoreValue !== 'number' || !Number.isFinite(scoreValue)) {
          return NextResponse.json({ error: 'scoreKey and numeric scoreValue required' }, { status: 400 });
        }
        p.scores = p.scores || {};
        p.scores[scoreKey] = scoreValue;
        historyEntry(`score set: ${scoreKey}=${scoreValue}`);
        changed = true;
        break;
      }
      case 'bulkUpdate': {
        if (Array.isArray(body.segments)) {
          p.segments = body.segments.map((s: string) => s.trim()).filter(Boolean);
        }
        if (Array.isArray(body.tags)) {
          p.tags = body.tags.map((t: string) => t.trim()).filter(Boolean);
        }
        if (body.scores && typeof body.scores === 'object') {
          p.scores = body.scores;
        }
        historyEntry('bulk update');
        changed = true;
        break;
      }
      case 'replaceAll': {
        p.segments = Array.isArray(body.segments) ? body.segments.map((s: string) => s.trim()).filter(Boolean) : [];
        p.tags = Array.isArray(body.tags) ? body.tags.map((t: string) => t.trim()).filter(Boolean) : [];
        p.scores = body.scores && typeof body.scores === 'object' ? body.scores : {};
        historyEntry('replace all');
        changed = true;
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    if (changed) {
      await user.save();
      emitAdminEvent({ type: 'personalization.updated', userId: String(user._id), action });
    }
    return NextResponse.json({ success: true });
  } catch (err:any) {
    console.error('Admin personalization PUT error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
