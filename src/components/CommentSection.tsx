'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  likes: number;
  user: { id: string; username: string; avatar?: string };
}

interface Props {
  animeId: number;
  episodeId?: string;
}

export default function CommentSection({ animeId, episodeId }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const userId = session?.user?.id;

  useEffect(() => {
    setFetching(true);
    fetch(`/api/comments/${animeId}`)
      .then(r => r.json())
      .then(d => { setComments(Array.isArray(d) ? d : []); setFetching(false); })
      .catch(() => setFetching(false));
  }, [animeId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError('');
    const res = await fetch(`/api/comments/${animeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim(), episodeId }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to post'); setLoading(false); return; }
    setComments(c => [data, ...c]);
    setBody('');
    setLoading(false);
  };

  const deleteComment = async (id: string) => {
    await fetch(`/api/comments/${animeId}?id=${id}`, { method: 'DELETE' });
    setComments(c => c.filter(x => x.id !== id));
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 className="section-title" style={{ fontSize: 20, marginBottom: 24 }}>
        💬 Comments ({comments.length})
      </h2>

      {/* Post comment */}
      {session?.user ? (
        <form onSubmit={submit} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff',
            }}>
              {(((session.user as { username?: string }).username) || session.user.name || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                id="comment-input"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share your thoughts about this anime..."
                maxLength={1000}
                rows={3}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)', borderRadius: 12,
                  color: 'var(--text-primary)', fontSize: 14, padding: '12px 16px',
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{body.length}/1000</span>
                <button type="submit" className="btn-primary" disabled={loading || !body.trim()} style={{ padding: '8px 20px', fontSize: 13 }}>
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
              {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{error}</p>}
            </div>
          </div>
        </form>
      ) : (
        <div className="glass" style={{ borderRadius: 12, padding: 20, marginBottom: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>Sign in to join the discussion</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>Sign In</Link>
            <Link href="/register" className="btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }}>Register</Link>
          </div>
        </div>
      )}

      {/* Comment list */}
      {fetching ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
          <p style={{ fontSize: 14 }}>No comments yet. Be the first!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map(c => (
            <div key={c.id} className="glass" style={{ borderRadius: 12, padding: 16, display: 'flex', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#fff',
              }}>
                {c.user.username.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{c.user.username}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{timeAgo(c.createdAt)}</span>
                  {userId === c.user.id && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: 0 }}
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
