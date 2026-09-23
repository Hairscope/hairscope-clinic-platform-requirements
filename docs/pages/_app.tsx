import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import './styles.css'

NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.1 })

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => NProgress.start()
    const handleComplete = () => NProgress.done()

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
