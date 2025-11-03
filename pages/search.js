import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Header from '../components/Header'
import { fetchSearch } from '../utils/api'
import { translations } from '../utils/translations'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (query.length >= 3) {
      performSearch()
    } else {
      setResults([])
      setLoading(false)
      setError('')
    }
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSearch(query)
      if (JSON.stringify(data) !== JSON.stringify(results)) {
        setResults(data)
      }
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <div>
      <Head>
        <title>{`${translations.search} | ${translations.siteTitle}`}</title>
        <meta name="description" content={translations.metaSearch} />
        <meta name="keywords" content={translations.keywords} />
        <meta name="robots" content="index, follow" />
      </Head>
      <Header />
      <div className="container">
        <div className="center">
          <h1 className="title">{translations.search}</h1>
        </div>
        <form className="content-bg content-box">
          <div className="form-group">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={translations.searchPlaceholder}
              className="input"
            />
          </div>
        </form>
        {error && <p className="error">{error}</p>}
        <div className="content-bg content-box">
          <ul className="list">
            {results.map(result => (
              <li key={result.id} className="list-item">
                <Link href={`/pasta/${result.id}`} className="list-link list-title">{result.title}
                <p className="list-content">{result.content.substring(0, 128)}{result.content.length > 128 ? '...' : ''}</p></Link>

              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
