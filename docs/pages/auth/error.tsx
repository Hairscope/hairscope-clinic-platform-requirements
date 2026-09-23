import { useRouter } from 'next/router'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  const getMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return 'Access denied. Only @hairscope.ai accounts are allowed.'
      case 'Configuration':
        return 'Server configuration error. Please contact the admin.'
      default:
        return 'An authentication error occurred. Please try again.'
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'var(--nextra-bg, #fafafa)',
      color: 'var(--nextra-text, #111)'
    }}>
      <div style={{
        background: 'var(--nextra-card-bg, white)',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        textAlign: 'center',
        maxWidth: '400px',
        border: '1px solid var(--nextra-border-color, #e5e7eb)'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 16px', color: '#dc2626' }}>
          Authentication Error
        </h1>
        <p style={{ color: 'var(--nextra-text-secondary, #666)', fontSize: '14px', margin: '0 0 24px' }}>
          {getMessage()}
        </p>
        <a
          href="/auth/signin"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: '#9C754E',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Try Again
        </a>
      </div>
    </div>
  )
}
