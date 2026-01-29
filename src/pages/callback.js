import { useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Callback() {
  const router = useRouter()
  const { code, error } = router.query

  useEffect(() => {
    if (!code && !error) return

    if (error) {
      router.push(`/?auth=error&message=${error}`)
      return
    }

    // Exchange code for token
    const exchangeCode = async () => {
      try {
        await axios.get('/api/auth/callback', {
          params: { code },
        })
        router.push('/?auth=success')
      } catch (err) {
        console.error('Auth error:', err)
        router.push('/?auth=error')
      }
    }

    exchangeCode()
  }, [code, error, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Connecting with Spotify...</p>
    </div>
  )
}
