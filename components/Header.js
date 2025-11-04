import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { fetchRandom } from '../utils/api'
import { postLogout } from '../utils/api'
import { isLoggedIn } from '../utils/auth'
import { translations } from '../utils/translations'
import { MdMenuBook, MdHistory, MdShuffle, MdSearch, MdDownload, MdAdd, MdWbSunny, MdBrightness2, MdLogin, MdLogout, MdEdit } from 'react-icons/md'
import { API_BASE } from '../utils/api'

export default function Header({ showEdit = false, editHref = '' }) {
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

  const handleRandom = async () => {
    try {
      const data = await fetchRandom()
      router.push(`/pasta/${data.id}`)
    } catch (error) {
      console.error(error)
    }
  }

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
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-title">{translations.siteTitle}</Link>
        <nav className="nav">
          {showEdit && <Link href={editHref} title={translations.edit} className="glyph"><MdEdit size={24} color="currentColor" /></Link>}
          <Link href="/new" title={translations.new} className="glyph"><MdAdd size={24} color="currentColor" /></Link>
          <Link href="/recent/1" title={translations.recentEdits} className="glyph"><MdHistory size={24} color="currentColor" /></Link>
          <button onClick={handleRandom} title={translations.random} className="glyph"><MdShuffle size={24} color="currentColor" /></button>
          <Link href="/search" title={translations.search} className="glyph"><MdSearch size={24} color="currentColor" /></Link>
          <a href={`${API_BASE}/download_backup`} download title={translations.downloadBackup} className="glyph"><MdDownload size={24} color="currentColor" /></a>
          {loggedIn ? (
            <button onClick={handleLogout} title={translations.logoutTitle} className="glyph"><MdLogout size={24} color="currentColor" /></button>
          ) : (
            <Link href="/login" title={translations.login} className="glyph"><MdLogin size={24} color="currentColor" /></Link>
          )}
          <button onClick={toggleTheme} title={isDark ? translations.switchToLight : translations.switchToDark} className="glyph">
            {isDark ? <MdWbSunny size={24} color="currentColor" /> : <MdBrightness2 size={24} color="currentColor" />}
          </button>
        </nav>
      </div>
    </header>
  )
}
