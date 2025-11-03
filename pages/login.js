import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import { postLogin } from '../utils/api'
import { setToken, isLoggedIn } from '../utils/auth'
import { translations } from '../utils/translations'

export default function Login() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const token = await postLogin(code)
      setToken(token)
      router.push('/')
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <div>
      <Head>
        <title>{`${translations.siteTitle} - ${translations.login}`}</title>
        <meta name="description" content={translations.login} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container">
        <div className="center">
          <h1 className="title">{translations.login}</h1>
        </div>
        <form onSubmit={handleSubmit} className="content-bg form">
          <div className="form-group">
            <label className="label">{translations.codeLabel}</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="input"
              autocomplete="current-password"
            />
          </div>
          <button type="submit" className="button button-full">{translations.login}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
