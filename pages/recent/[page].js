import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '../../components/Header'
import { fetchRecent, postDelete, postDeleteImage, API_BASE } from '../../utils/api'
import { isLoggedIn } from '../../utils/auth'
import { translations } from '../../utils/translations'
import { MdDelete } from 'react-icons/md'

export default function Recent() {
  const router = useRouter()
  const { page } = router.query
  const pageNum = parseInt(page) || 1
  const [entries, setEntries] = useState([])
  const [start, setStart] = useState((pageNum - 1) * 100)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [currentEnd, setCurrentEnd] = useState(pageNum * 100)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const hasLoaded = useRef(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  useEffect(() => {
    if (!loading) {
      const scrollY = sessionStorage.getItem('browseScroll')
      if (scrollY) {
        setTimeout(() => window.scrollTo(0, parseInt(scrollY)), 0)
        sessionStorage.removeItem('browseScroll')
      }
    }
  }, [loading])

  useEffect(() => {
    if (!hasLoaded.current && page) {
      hasLoaded.current = true
      loadEntries(0, pageNum * 100)
    }
  }, [page, isMobile])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (!loading && !isLoadingMore && entries.length === currentEnd) {
          loadMore()
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile, loading, isLoadingMore, entries, currentEnd])

  const loadEntries = async (newStart, end) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchRecent(newStart, end)
      setEntries(data)
      setStart(newStart)
      setCurrentEnd(end)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
    setLoading(false)
  }

  const loadMore = async () => {
    const newStart = currentEnd
    const newEnd = currentEnd + 100
    setIsLoadingMore(true)
    try {
      const data = await fetchRecent(newStart, newEnd)
      setEntries(prev => [...prev, ...data])
      setCurrentEnd(newEnd)
    } catch (error) {
      console.error(error)
    }
    setIsLoadingMore(false)
  }

  const handlePrev = () => {
    if (pageNum > 1) {
      router.push(`/recent/${pageNum - 1}`)
    }
  }

  const handleNext = () => {
    if (entries.length === 100) {
      router.push(`/recent/${pageNum + 1}`)
    }
  }

  const handleDelete = async (id, timestamp, index, type) => {
    if (!isLoggedIn()) return
    const confirmed = type === 'image_added' ? window.confirm(translations.confirmDeleteImage) : window.confirm(translations.confirmDeleteEntry)
    if (!confirmed) return
    try {
      if (type === 'image_added') {
        await postDeleteImage(id)
      } else {
        await postDelete(id, timestamp)
      }
      setEntries(prev => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  return (
    <div>
      <Head>
        <title>{`${translations.recentEdits} | ${translations.siteTitle}`}</title>
        <meta name="description" content={translations.metaRecent} />
        <meta name="keywords" content={translations.keywords} />
        <meta name="robots" content="index, follow" />
      </Head>
      <Header />
      <div className="container">
        <div className="center">
          <h1 className="title">{translations.recentEdits}</h1>
          <p className="subtitle">{translations.recentSubtitle}</p>
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <div className="loading">
            <div className="loading-center">
              <div className="spinner"></div>
              <p className="loading-text">{translations.loading}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="content-bg content-box">
              <ul className="list">
                {entries.map((entry, index) => (
                  <li key={entry.id + '-' + entry.timestamp} className="list-item">
                    <Link href={`/pasta/${entry.id}`} onClick={() => sessionStorage.setItem('browseScroll', window.scrollY)} className="list-link">
                      <div className="list-title">{entry.title} ({entry.type === 'edit' ? translations.edited : entry.type === 'image_added' ? translations.imageAdded : translations.created})</div>
                      {entry.type === 'image_added' ? (
                        <img src={`${API_BASE}/images/${entry.id}/${entry.content}`} alt="Added image" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '4px' }} />
                      ) : (
                        <p className="list-content">{entry.content}</p>
                      )}
                      <p className="list-timestamp">{new Date(entry.timestamp * 1000).toLocaleString('fi-FI')}</p>
                    </Link>
                    {isLoggedIn() && (
                      <button
                        className="button glyph"
                        title={translations.delete}
                        onClick={() => handleDelete(entry.id, entry.timestamp, index, entry.type)}
                        style={{ marginLeft: 'auto', marginRight: '8px' }}
                      >
                        <MdDelete size={18} color="currentColor" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {isLoadingMore && (
                <div className="loading">
                  <div className="loading-center">
                    <div className="spinner"></div>
                    <p className="loading-text">{translations.loading}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
