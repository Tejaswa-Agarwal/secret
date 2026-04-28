'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// IMPORTANT: Field must be defined OUTSIDE the page component
// so React doesn't recreate it on every render (causing focus loss)
interface FieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}
function Field({ id, label, type, placeholder, value, onChange }: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        className="search-input"
        style={{ width: '100%', padding: '12px 16px', fontSize: 14 }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass" style={{ width: '100%', maxWidth: 400, borderRadius: 20, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            <span className="gradient-text">Welcome Back</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to your AniStream account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field id="login-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
          <Field id="login-password" label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} />

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent-2)', fontWeight: 600, textDecoration: 'none' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
