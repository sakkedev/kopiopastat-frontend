import Head from 'next/head'
import Header from '../components/Header'
import { translations } from '../utils/translations'

export default function Custom404() {
  return (
    <div>
      <Head>
        <title>404 - {translations.pageNotFound} | {translations.siteTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
      <div className="container">
        <div className="center">
          <h1 className="title">404 - {translations.pageNotFound}</h1>
          <p>{translations.pageNotFoundDescription}</p>
        </div>
      </div>
    </div>
  )
}
