import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { useLocalized } from '../hooks/useLocalized'
import { Paginated, BlogPost } from '../types'
import FilterChips from '../components/ui/FilterChips'
import Pagination from '../components/ui/Pagination'

const CATEGORIES = [
  { key: '', label: 'blog.all' },
  { key: 'news', label: 'blog.news' },
  { key: 'tips', label: 'blog.tips' },
]

export default function BlogPage() {
  const { t } = useTranslation()
  const localize = useLocalized()
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const { data, loading } = usePublicData<Paginated<BlogPost>>(
    '/api/blog',
    { page, limit: 12, ...(category ? { category } : {}) }
  )

  const filterOptions = CATEGORIES.map(c => ({ key: c.key, label: t(c.label) }))

  return (
    <div className="pub-section">
      <h1 className="pub-section-title">{t('blog.title')}</h1>
      <p className="pub-section-subtitle">{t('blog.subtitle')}</p>

      <FilterChips
        options={filterOptions}
        value={category}
        onChange={key => { setCategory(key); setPage(1) }}
      />

      {loading ? (
        <div className="pub-grid-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="pub-card">
              <div className="pub-skeleton" style={{ paddingTop: '60%' }} />
              <div style={{ padding: 20 }}>
                <div className="pub-skeleton" style={{ height: 18, marginBottom: 8 }} />
                <div className="pub-skeleton" style={{ height: 14, marginBottom: 4 }} />
                <div className="pub-skeleton" style={{ height: 14, width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <div className="pub-grid-3">
            {data.items.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div className="pub-card">
                  {post.cover_url ? (
                    <img src={post.cover_url} alt={localize(post.title)} className="pub-card__img" loading="lazy" />
                  ) : (
                    <div className="pub-card__img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 48, color: 'var(--text-muted)' }}>📝</span>
                    </div>
                  )}
                  <div className="pub-card__body">
                    {post.category && <span className="pub-card__tag">{post.category}</span>}
                    <div className="pub-card__title">{localize(post.title)}</div>
                    <p className="pub-card__excerpt">{localize(post.excerpt)}</p>
                    <div className="pub-card__meta">
                      {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination page={page} pages={data.pages} onChange={setPage} />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>No posts yet.</div>
      )}
    </div>
  )
}
