import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '../components/Header'
import { postLogout } from '../utils/api'
import { isLoggedIn } from '../utils/auth'
import { translations } from '../utils/translations'
import { MdWbSunny, MdBrightness2 } from 'react-icons/md'
import { API_BASE } from '../utils/api'

export default function Settings() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDark(initialTheme)
    setLoggedIn(isLoggedIn())
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    try {
      await postLogout()
      window.location.reload()
    } catch (error) {
      console.error(error)
      window.location.reload()
    }
  }

  return (
    <div>
      <Head>
        <title>{`Settings | ${translations.siteTitle}`}</title>
        <meta name="description" content="Settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container">
        <div className="center">
          <h1 className="title">Settings</h1>
        </div>
        <div className="content-bg content-box">
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="label">{translations.theme}</label>
            <button onClick={toggleTheme} className="button">
              {isDark ? <><MdWbSunny size={24} color="currentColor" /> Light (Yotsuba)</> : <><MdBrightness2 size={24} color="currentColor" /> Dark</>}
            </button>
          </div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="label">{translations.downloadBackup}</label>
            <a href={`${API_BASE}/download_backup`} download className="button">{translations.downloadBackup}</a>
          </div>
          <div className="form-group">
            <label className="label">{translations.account}</label>
            {loggedIn ? (
              <button onClick={handleLogout} className="button">{translations.logoutTitle}</button>
            ) : (
              <Link href="/login" className="button">{translations.login}</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
