import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '../../components/Header'
import { fetchBrowse } from '../../utils/api'
import { translations } from '../../utils/translations'

export default function Browse() {
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
    if (page) {
      if (isMobile) {
        loadEntries(0, pageNum * 100)
      } else {
        loadEntries((pageNum - 1) * 100, pageNum * 100)
      }
    }
  }, [page, isMobile])

  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
          if (!loading && !isLoadingMore && entries.length === currentEnd) {
            loadMore()
          }
        }
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile, loading, isLoadingMore, entries, currentEnd])

  const loadEntries = async (newStart, end) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchBrowse(newStart, end)
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
      const data = await fetchBrowse(newStart, newEnd)
      setEntries(prev => [...prev, ...data])
      setCurrentEnd(newEnd)
    } catch (error) {
      console.error(error)
    }
    setIsLoadingMore(false)
  }

  const handlePrev = () => {
    if (pageNum > 1) {
      router.push(`/browse/${pageNum - 1}`)
    }
  }

  const handleNext = () => {
    if (entries.length === 100) {
      router.push(`/browse/${pageNum + 1}`)
    }
  }

  return (
    <div>
      <Head>
        <title>{`${translations.siteTitle} - ${translations.browse} kopiopastoja sivu ${pageNum}`}</title>
        <meta name="description" content={translations.metaBrowsePage.replace('{page}', pageNum)} />
        <meta name="keywords" content={translations.keywords} />
        <meta name="robots" content="index, follow" />
      </Head>
      <Header />
      <div className="container">
        <div className="center">
          <h1 className="title">{translations.browse} kopiopastoja</h1>
          <p className="subtitle">{translations.subtitle}</p>
        </div>
        {error && <p className="error">{error}</p>}
        <>
          <div className="content-bg content-box">
            <ul className="list">
              {entries.map(entry => (
                <li key={entry.id} className="list-item">
                  <Link href={`/pasta/${entry.id}`} onClick={() => sessionStorage.setItem('browseScroll', window.scrollY)} className="list-link">
                    <div className="list-title">{entry.title}</div>
                    <p className="list-content">{entry.content}</p>
                  </Link>
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
          {!isMobile && (
            <div className="button-group">
              <button className="button" onClick={handlePrev} disabled={pageNum === 1}>{translations.previous}</button>
              <button className="button" onClick={handleNext} disabled={entries.length < 100}>{translations.next}</button>
            </div>
          )}
        </>
      </div>
    </div>
  )
}
