import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import { postNew, fetchCaptchaQuestion, postCaptchaAnswer, fetchVerifyCaptcha } from '../utils/api'
import { isLoggedIn } from '../utils/auth'
import { translations } from '../utils/translations'

export default function New() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [foundInGoogle, setFoundInGoogle] = useState(false)
  const [error, setError] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaIndex, setCaptchaIndex] = useState(null)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaSolved, setCaptchaSolved] = useState(false)
  const [captchaError, setCaptchaError] = useState('')
  const fileInputRef = useRef(null)
  const loggedIn = isLoggedIn()

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!loggedIn && !captchaSolved) {
      setError('Please solve the CAPTCHA first.')
      return
    }
    setError('')
    try {
      const data = await postNew(title, content, file, foundInGoogle)
      router.push(`/pasta/${data.id}`)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

  useEffect(() => {
    if (!loggedIn) {
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
  }, [])

  return (
    <div>
      <Head>
        <title>{`${translations.new} kopiopasta | ${translations.siteTitle}`}</title>
        <meta name="description" content={translations.metaNew} />
        <meta name="keywords" content={`${translations.keywords}, ${translations.new}, ${translations.create}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container" onPaste={handlePaste}>
        <div className="center">
          <h1 className="title">{translations.new} kopiopasta</h1>
        </div>
        <form onSubmit={handleSubmit} className="content-bg form">
          <div className="form-group">
            <label className="label">{translations.titleLabel}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="label">{translations.contentLabel}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              className="textarea"
            />
          </div>
          <div className="form-group">
            <label className="label">
              <input
                type="checkbox"
                checked={foundInGoogle}
                onChange={(e) => setFoundInGoogle(e.target.checked)}
                style={{ transform: 'scale(1.2)', marginRight: '8px' }}
              />
              {translations.foundInGoogle}
            </label>
          </div>
          <div className="form-group">
            <label className="label">{translations.uploadImageLabel}</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.avif"
              onChange={(e) => setFile(e.target.files[0])}
              className="input"
              ref={fileInputRef}
            />
            <div style={{ marginTop: '8px' }}>
              <p className="default-text" style={{ fontSize: '14px' }}>{file ? translations.selectedFile.replace('{filename}', file.name) : translations.noFileChosen}</p>
              {file && (
                <button type="button" onClick={() => { setFile(null); fileInputRef.current.value = ''; }} className="button button-small">{translations.clear}</button>
              )}
            </div>
          </div>
          {!loggedIn && !captchaSolved && (
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
          <button type="submit" className="button button-full" disabled={!loggedIn && !captchaSolved}>{translations.create}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
