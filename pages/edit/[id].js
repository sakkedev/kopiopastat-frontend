import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Header from '../../components/Header'
import { fetchEntry, postEdit, postUploadImage, postDeleteImage, fetchCaptchaQuestion, postCaptchaAnswer, fetchVerifyCaptcha } from '../../utils/api'
import { isLoggedIn } from '../../utils/auth'
import { translations } from '../../utils/translations'

export default function Edit() {
  const router = useRouter()
  const { id } = router.query
  const [entry, setEntry] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaIndex, setCaptchaIndex] = useState(null)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaSolved, setCaptchaSolved] = useState(false)
  const [captchaError, setCaptchaError] = useState('')
  const fileInputRef = useRef(null)
  const loggedIn = isLoggedIn()

  useEffect(() => {
    if (id) {
      loadEntry()
    }
  }, [id])

  const loadEntry = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchEntry(id)
      setEntry(data)
      setTitle(data.title)
      setContent(data.content)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
    setLoading(false)
  }

  const loadCaptcha = async () => {
    try {
      const data = await fetchCaptchaQuestion()
      setCaptchaQuestion(data.question)
      setCaptchaIndex(data.index)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  const handleCaptchaSubmit = async (e) => {
    e.preventDefault()
    setCaptchaError('')
    try {
      await postCaptchaAnswer(captchaAnswer, captchaIndex)
      setCaptchaSolved(true)
    } catch (error) {
      console.error(error)
      setCaptchaError(translations.incorrectCaptcha)
      loadCaptcha() // Reload captcha on failure
    }
  }

  const handlePaste = (e) => {
    const items = e.clipboardData.items
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        if (['image/jpeg', 'image/png', 'image/avif'].includes(blob.type)) {
          let filename = blob.name || `pasted-image.${blob.type.split('/')[1]}`
          const pastedFile = new File([blob], filename, { type: blob.type })
          setFile(pastedFile)
          e.preventDefault()
          break
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!loggedIn && !captchaSolved && file) {
      setError('Please solve the CAPTCHA first.')
      return
    }
    setError('')
    try {
      if (loggedIn) {
        await postEdit(id, content, title)
      }
      if (file) {
        await postUploadImage(id, file.name, file)
      }
      router.push(`/pasta/${id}`)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  const handleDeleteImage = async () => {
    if (!entry || !entry.filename) return
    const confirmed = window.confirm(translations.confirmDeleteImage)
    if (!confirmed) return
    setError('')
    try {
      await postDeleteImage(id)
      setEntry(prev => ({ ...prev, filename: null }))
    } catch (error) {
      console.error(error)
      setError(error.message)
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

  useEffect(() => {
    if (!loggedIn && !entry?.filename) {
      const captchaToken = localStorage.getItem('captcha_token')
      if (captchaToken) {
        fetchVerifyCaptcha().then(data => {
          if (data.valid) {
            setCaptchaSolved(true)
          } else {
            loadCaptcha()
          }
        }).catch(() => {
          loadCaptcha()
        })
      } else {
        loadCaptcha()
      }
    } else {
      setCaptchaSolved(true)
    }
  }, [loggedIn, entry])

  if (loading) return (
    <div>
      <Head>
        <title>{`${translations.siteTitle} - ${translations.loadingEdit}`}</title>
        <meta name="description" content={translations.loadingEdit} />
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

  return (
    <div>
      <Head>
        <title>{`${translations.edit} ${entry.title} | ${translations.siteTitle}`}</title>
        <meta name="description" content={translations.metaEdit.replace('{title}', entry.title)} />
        <meta name="keywords" content={`${translations.keywords}, ${entry.title}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container" onPaste={handlePaste}>
        <div className="center">
          <h1 className="title">{entry.title}</h1>
        </div>
        <form onSubmit={handleSubmit} className="content-bg form">
          {loggedIn && (
            <div className="form-group">
              <label className="label">{translations.titleLabel}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
              />
            </div>
          )}
          <div className="form-group">
            <label className="label">{translations.contentLabel}</label>
            {loggedIn ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                readOnly={!loggedIn}
                className="textarea"
                onPaste={handlePaste}
              />
            ) : (
              <div className="entry-content" style={{ margin: 0 }}>
                {renderContent(content)}
              </div>
            )}
          </div>
          <div className="form-group">
            {!entry.filename && (
              <>
                <label className="label">{translations.uploadImageLabel}</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.avif"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="input"
                  ref={fileInputRef}
                />
              </>
            )}
            <div style={{ marginTop: '8px' }}>
              <p className="default-text" style={{ fontSize: '14px' }}>{entry.filename ? translations.currentImage.replace('{filename}', entry.filename) : file ? translations.selectedFile.replace('{filename}', file.name) : translations.noFileChosen}</p>
              {file && (
                <button type="button" onClick={() => { setFile(null); fileInputRef.current.value = ''; }} className="button button-small">{translations.clear}</button>
              )}
              {entry.filename && loggedIn && (
                <button type="button" onClick={handleDeleteImage} className="button button-small" style={{ marginLeft: '8px' }}>{translations.deleteImage}</button>
              )}
            </div>
          </div>
          {!loggedIn && !entry.filename && !captchaSolved && (
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label">CAPTCHA: {captchaQuestion}</label>
              <input
                type="text"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                required
                className="input"
              />
              <button type="button" onClick={handleCaptchaSubmit} className="button button-small" style={{ marginTop: '8px' }}>{translations.verifyCaptcha}</button>
              {captchaError && (
                <div className="notification notification-error" style={{ position: 'absolute', top: '-50px', left: '0', width: '100%' }}>
                  {captchaError}
                </div>
              )}
            </div>
          )}
          <div className="button-group" style={{ flexDirection: 'row' }}>
            <Link href={`/pasta/${id}`}><button type="button" className="button">{translations.cancel}</button></Link>
            <button type="submit" className="button" disabled={!loggedIn && !entry.filename && !captchaSolved}>{translations.save}</button>
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
