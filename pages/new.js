import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import { postNew } from '../utils/api'
import { translations } from '../utils/translations'

export default function New() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

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
    setError('')
    try {
      const data = await postNew(title, content, file)
      router.push(`/pasta/${data.id}`)
    } catch (error) {
      console.error(error)
      setError(error.message)
    }
  }

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
          <button type="submit" className="button button-full">{translations.create}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
