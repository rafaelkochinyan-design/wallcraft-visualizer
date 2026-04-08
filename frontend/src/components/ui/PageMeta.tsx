import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
}

const SITE_NAME = 'WallCraft'
const DEFAULT_IMAGE = '/og-image.jpg'
const BASE_URL = 'https://frontend-beige-six-43.vercel.app'

export default function PageMeta({
  title,
  description = 'Handcrafted 3D gypsum wall panels for your interior. Visualize your space before you buy.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
}: PageMetaProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  )
}
