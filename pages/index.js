import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '../components/Header'
import { fetchBrowse, fetchDataVersion } from '../utils/api'
import { translations } from '../utils/translations'

export default function Home() {
  const router = useRouter()
  const pageNum = 1
  const [entries, setEntries] = useState([])
  const [start, setStart] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [currentEnd, setCurrentEnd] = useState(100)
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
    if (!hasLoaded.current) {
      hasLoaded.current = true
      loadFromCache()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if (!loading && !isLoadingMore && entries.length === currentEnd) {
          loadMore()
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, isLoadingMore, entries, currentEnd])

  const loadFromCache = async () => {
    const cachedContents = localStorage.getItem('frontpageEntries')
    const cachedVersion = localStorage.getItem('dataVersion')
    const isMobileNow = window.innerWidth < 768
    const end = isMobileNow ? 200 : 100
    if (cachedContents) {
      const parsed = JSON.parse(cachedContents)
      setEntries(parsed)
      setCurrentEnd(parsed.length)
    }
    try {
      const versionData = await fetchDataVersion()
      const currentVersion = versionData.version
      if (!cachedVersion || parseInt(cachedVersion) !== currentVersion) {
        const data = await fetchBrowse(0, end)
        setEntries(data.contents)
        localStorage.setItem('frontpageEntries', JSON.stringify(data.contents))
        localStorage.setItem('dataVersion', currentVersion.toString())
        setCurrentEnd(end)
      } else {
        if (!cachedContents) {
          const data = await fetchBrowse(0, end)
          setEntries(data.contents)
          localStorage.setItem('frontpageEntries', JSON.stringify(data.contents))
          setCurrentEnd(end)
        }
      }
    } catch (error) {
      console.error(error)
      if (!cachedContents) {
        setError(error.message)
      }
      setCurrentEnd(end)
    }
    setLoading(false)
  }

  const loadMore = async () => {
    const newStart = currentEnd
    const newEnd = currentEnd + 100
    setIsLoadingMore(true)
    try {
      const data = await fetchBrowse(newStart, newEnd)
      const newEntries = [...entries, ...data.contents]
      setEntries(newEntries)
      setCurrentEnd(newEnd)
      localStorage.setItem('frontpageEntries', JSON.stringify(newEntries))
    } catch (error) {
      console.error(error)
    }
    setIsLoadingMore(false)
  }

  const handlePrev = () => {
    // No previous for page 1
  }

  const handleNext = () => {
    if (entries.length === 100) {
      router.push(`/browse/2`)
    }
  }

  return (
    <div>
      <Head>
        <title>{`${translations.browse} kopiopastoja | ${translations.siteTitle}`}</title>
        <meta name="description" content={translations.metaBrowse} />
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
        </>
      </div>
    </div>
  )
}
