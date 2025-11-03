import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '../../components/Header'
import { fetchEntry, fetchGetByOrder, fetchRandom, postDelete, API_BASE } from '../../utils/api'
import { isLoggedIn } from '../../utils/auth'
import { translations } from '../../utils/translations'
import { MdChevronLeft, MdShuffle, MdChevronRight, MdContentCopy, MdEdit, MdDelete, MdDownload, MdImage } from 'react-icons/md'

export default function Entry() {
  const router = useRouter()
  const { id } = router.query
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageCopied, setImageCopied] = useState(false)
  const [imageExpanded, setImageExpanded] = useState(false)
  const loadedId = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    if (id && id !== loadedId.current) {
      loadedId.current = id
      loadEntry()
    }
  }, [id])

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  useEffect(() => {
    if (imageCopied) {
      const timer = setTimeout(() => setImageCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [imageCopied])

  const loadEntry = async () => {
    setError('')
    try {
      const data = await fetchEntry(id)
      setEntry(data)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
    setLoading(false)
  }

  const handlePrev = async () => {
    if (entry && entry.order_index > 0) {
      try {
        const data = await fetchGetByOrder(entry.order_index - 1)
        router.push(`/pasta/${data.id}`)
      } catch (error) {
        console.error(error)
        setError(translations.noPreviousEntry)
      }
    }
  }

  const handleNext = async () => {
    if (entry && !entry.last_in_order) {
      try {
        const data = await fetchGetByOrder(entry.order_index + 1)
        router.push(`/pasta/${data.id}`)
      } catch (error) {
        console.error(error)
        setError(translations.noNextEntry)
      }
    }
  }

  const handleRandom = async () => {
    try {
      const data = await fetchRandom()
      router.push(`/pasta/${data.id}`)
    } catch (error) {
      console.error(error)
      setError(translations.randomLoadFailed)
    }
  }

  const handleCopy = async () => {
    if (entry) {
      try {
        await navigator.clipboard.writeText(entry.content)
        setCopied(true)
      } catch (error) {
        console.error('Failed to copy: ', error)
      }
    }
  }

  const handleCopyImage = async () => {
    if (entry && entry.filename) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            setImageCopied(true)
          } catch (error) {
            console.error('Failed to copy image: ', error)
          }
        }, 'image/png')
      }
      img.src = `${API_BASE}/images/${entry.id}/${entry.filename}`
    }
  }

  const handleDownloadImage = async () => {
    if (entry && entry.filename) {
      try {
        const response = await fetch(`${API_BASE}/images/${entry.id}/${entry.filename}`)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = entry.filename
        link.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to download image: ', error)
      }
    }
  }

  const handleDelete = async () => {
    if (!entry || !isLoggedIn()) return
    const confirmed = window.confirm(translations.confirmDeleteArticle)
    if (!confirmed) return
    try {
      const result = await postDelete(entry.id, entry.timestamp)
      if (result.type === 'article') {
        router.push('/')
      } else {
        window.location.reload()
      }
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  const handleImageClick = () => {
    if (imgRef.current && (imgRef.current.naturalWidth > 200 || imgRef.current.naturalHeight > 200)) {
      setImageExpanded(!imageExpanded)
    }
  }

  const renderContent = (content) => {
    return content.split('\n').map((line, index) => {
      let className = 'default-text';
      if (line.startsWith('>')) className = 'quote-text';
      else if (line.startsWith('<')) className = 'response-text';
      return <div key={index} className={className}>{line || '\u00A0'}</div>;
    });
  };

  if (loading) return (
    <div>
      <Head>
        <title>{`${translations.siteTitle} - ${translations.metaLoadingEntry}`}</title>
        <meta name="description" content={translations.metaLoadingEntry} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container">
        <div className="loading">
          <div className="loading-center">
            <div className="spinner"></div>
            <p className="loading-text">{translations.loading}</p>
          </div>
        </div>
      </div>
    </div>
  )
  if (!entry) return (
    <div>
      <Head>
        <title>{`${translations.siteTitle} - ${translations.entryNotFound}`}</title>
        <meta name="description" content={translations.entryNotFound} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container">
        <div className="loading">
          <div className="loading-center">
            <p className="loading-text">{translations.entryNotFound}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const timestamp = new Date(entry.timestamp * 1000).toLocaleString('fi-FI')
  const isModified = entry.num_contents > 1

  return (
    <div>
      <Head>
        <title>{`${entry.title} | ${translations.siteTitle}`}</title>
        <meta name="description" content={entry.content.substring(0, 290) + (entry.content.length > 290 ? '...' : '')} />
        <meta name="keywords" content={`${translations.keywords}, ${entry.title}`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={entry.title} />
        <meta property="og:site_name" content={translations.siteTitle} />
        <meta property="og:description" content={entry.content.substring(0, 480) + (entry.content.length > 480 ? '...' : '')} />
        <meta property="og:type" content="article" />
        {entry.filename && <meta property="og:image" content={`${API_BASE}/images/${entry.id}/${entry.filename}`} />}
      </Head>
      <Header />
      <div className="button-group-center">
        <button className="button glyph" onClick={handlePrev} disabled={entry.order_index === 0}><MdChevronLeft size={24} color="currentColor" /></button>
        <button className="button glyph" onClick={handleRandom}><MdShuffle size={24} color="currentColor" /></button>
        {!entry.last_in_order && <button className="button glyph" onClick={handleNext}><MdChevronRight size={24} color="currentColor" /></button>}
      </div>
      <div className="container">
        <div className="content-bg content-box">
          <h2 className="entry-title">{entry.title}</h2>
          <div className="entry-layout">
            {entry.filename && (
              <div className={`entry-image-section ${imageExpanded ? 'expanded' : ''}`}>
                <img ref={imgRef} src={`/api/images/${entry.id}/${entry.filename}`} alt="Entry image" className={`entry-image ${imageExpanded ? 'expanded' : ''}`} onClick={handleImageClick} />
              </div>
            )}
            <div className="entry-text-section">
              <div className="entry-content">
                {renderContent(entry.content)}
              </div>
            </div>
            <div className="button-group-small">
              <button className="button glyph" title={translations.copyText} onClick={handleCopy}><MdContentCopy size={18} color="currentColor" /></button>
              <Link href={`/edit/${id}`}>
                <button className="button glyph" title={translations.edit}><MdEdit size={18} color="currentColor" /></button>
              </Link>
              {isLoggedIn() && (
                <button className="button glyph" title={translations.delete} onClick={handleDelete}><MdDelete size={18} color="currentColor" /></button>
              )}
              {entry.filename && (
                <>
                  <button className="button glyph" title={translations.copyImage} onClick={handleCopyImage}><MdImage size={18} color="currentColor" /></button>
                  <button className="button glyph" title={translations.downloadImage} onClick={handleDownloadImage}><MdDownload size={18} color="currentColor" /></button>
                </>
              )}
              {copied && <div className="notification">{translations.copiedToClipboard}</div>}
              {imageCopied && <div className="notification">{translations.imageCopied}</div>}
            </div>
            {isModified ? (
              <Link href={`/history/${id}`}>
              <div className="entry-timestamp-link">{translations.modifiedAt} {timestamp}</div>
              </Link>
              ) : (
           <div className="entry-timestamp">{translations.createdAt} {timestamp}</div>
            )}
          </div>

        </div>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}
