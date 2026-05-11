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
      background: '#fafafa'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 16px', color: '#dc2626' }}>
          Authentication Error
        </h1>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 24px' }}>
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
