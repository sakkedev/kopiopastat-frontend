import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { fetchHistory } from '../../utils/api'
import { translations } from '../../utils/translations'

export default function History() {
  const router = useRouter()
  const { id } = router.query
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDiff, setShowDiff] = useState({})
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (!hasLoaded.current && id) {
      hasLoaded.current = true
      loadHistory()
    }
  }, [id])

  const loadHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchHistory(id)
      setHistory(data)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
    setLoading(false)
  }

  const computeDiff = (oldText, newText) => {
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    const diff = []
    const maxLen = Math.max(oldLines.length, newLines.length)
    for (let i = 0; i < maxLen; i++) {
      if (oldLines[i] !== newLines[i]) {
        if (oldLines[i] && !newLines[i]) {
          diff.push({ type: 'remove', text: oldLines[i] })
        } else if (!oldLines[i] && newLines[i]) {
          diff.push({ type: 'add', text: newLines[i] })
        } else {
          diff.push({ type: 'change', old: oldLines[i], new: newLines[i] })
        }
      } else {
        diff.push({ type: 'same', text: oldLines[i] })
      }
    }
    return diff
  }

  const toggleDiff = (index) => {
    setShowDiff(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const renderContent = (content) => {
    return content.split('\n').map((line, index) => {
      let className = 'default-text';
      if (line.startsWith('>')) className = 'quote-text';
      else if (line.startsWith('<')) className = 'response-text';
      return <div key={index} className={className}>{line || '\u00A0'}</div>;
    });
  };

  const renderDiff = (diff) => {
    return diff.map((part, index) => {
      if (part.type === 'remove') {
        return <div key={index} style={{color: 'rgb(255, 0, 0)'}}>- {part.text || '\u00A0'}</div>
      } else if (part.type === 'add') {
        return <div key={index} style={{color: 'rgb(0, 128, 0)'}}>+ {part.text || '\u00A0'}</div>
      } else if (part.type === 'change') {
        return (
          <div key={index}>
            <div style={{color: 'rgb(255, 0, 0)'}}>- {part.old || '\u00A0'}</div>
            <div style={{color: 'rgb(0, 128, 0)'}}>+ {part.new || '\u00A0'}</div>
          </div>
        )
      } else {
        return <div key={index} className="default-text">{part.text || '\u00A0'}</div>
      }
    })
  }

  if (loading) return (
    <div>
      <Head>
        <title>{`${translations.siteTitle} - ${translations.loadingHistory}`}</title>
        <meta name="description" content={translations.loadingHistory} />
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
  if (!history) return (
    <div>
      <Head>
        <title>{`${translations.siteTitle} - ${translations.historyNotFound}`}</title>
        <meta name="description" content={translations.historyNotFound} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container">
        <div className="loading">
          <div className="loading-center">
            <p className="loading-text">{translations.historyNotFound}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const reversedContents = history.contents.slice().reverse()

  return (
    <div>
      <Head>
        <title>{`${translations.historyOf} ${history.title} | ${translations.siteTitle}`}</title>
        <meta name="description" content={translations.metaHistory.replace('{title}', history.title)} />
        <meta name="keywords" content={`${translations.keywords}, ${translations.historyOf}, ${history.title}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container">
        <div className="center">
          <h1 className="title">{translations.historyOf} {history.title}</h1>
        </div>
        {error && <p className="error">{error}</p>}
        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          {reversedContents.map((item, index) => (
            <div key={index} className="content-bg history-item">
              <p className="history-timestamp">{translations.timestamp} {new Date(item.timestamp * 1000).toLocaleString('fi-FI')}</p>
              {index < reversedContents.length - 1 && (
                <button className="button button-small" onClick={() => toggleDiff(index)}>{translations.differences}</button>
              )}
              {showDiff[index] && index < reversedContents.length - 1 && (
                <div style={{marginTop: '16px', borderTop: '1px solid #d9bfb7', paddingTop: '16px'}}>
                  <h3 className="default-text">{translations.differencesToPrevious}</h3>
                  <div className="history-content">
                    {renderDiff(computeDiff(reversedContents[index + 1].content, item.content))}
                  </div>
                </div>
              )}
              {!showDiff[index] && (
                <div className="history-content">
                  {renderContent(item.content)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
