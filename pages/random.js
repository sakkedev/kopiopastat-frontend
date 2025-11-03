import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import { fetchRandom } from '../utils/api'
import { translations } from '../utils/translations'

export default function Random() {
  const router = useRouter()
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true
      loadRandom()
    }
  }, [])

  const loadRandom = async () => {
    try {
      const data = await fetchRandom()
      router.replace(`/pasta/${data.id}`)
    } catch (error) {
      console.error(error)
      // Since this redirects, perhaps show error on the target page, but for now, just log
    }
  }

  return (
    <div>
      <Head>
        <title>{`${translations.random} kopiopasta | ${translations.siteTitle}`}</title>
        <meta name="description" content={translations.metaRandom} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header />
    </div>
  )
}
