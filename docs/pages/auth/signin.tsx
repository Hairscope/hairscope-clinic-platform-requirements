import { signIn } from 'next-auth/react'
import Head from 'next/head'

export default function SignIn() {
  return (
    <>
      <Head>
        <title>Sign In – Hairscope Docs</title>
        <style>{`
          :root {
            --signin-bg: #fafafa;
            --signin-card-bg: #ffffff;
            --signin-text: #111827;
            --signin-text-secondary: #6b7280;
            --signin-border: #e5e7eb;
            --signin-btn-hover: #f5f5f5;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --signin-bg: #111111;
              --signin-card-bg: #1a1a1a;
              --signin-text: #e5e7eb;
              --signin-text-secondary: #9ca3af;
              --signin-border: #333333;
              --signin-btn-hover: #2a2a2a;
            }
          }
        `}</style>
      </Head>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'var(--signin-bg)',
        color: 'var(--signin-text)'
      }}>
        <div style={{
          background: 'var(--signin-card-bg)',
          padding: '48px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          textAlign: 'center',
          maxWidth: '400px',
          border: '1px solid var(--signin-border)'
        }}>
          <img src="/logo.png" alt="Hairscope" style={{ height: '32px', marginBottom: '24px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px', color: 'var(--signin-text)' }}>
            Internal Documentation
          </h1>
          <p style={{ color: 'var(--signin-text-secondary)', fontSize: '14px', margin: '0 0 32px' }}>
            Sign in with your Hairscope Google account to access team docs.
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/internal' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '12px 24px',
              border: '1px solid var(--signin-border)',
              borderRadius: '8px',
              background: 'var(--signin-card-bg)',
              color: 'var(--signin-text)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          <p style={{ color: 'var(--signin-text-secondary)', fontSize: '12px', marginTop: '24px' }}>
            Only @hairscope.ai accounts are allowed.
          </p>
        </div>
      </div>
    </>
  )
}
