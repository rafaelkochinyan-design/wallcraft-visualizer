import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { useLocalized } from '../hooks/useLocalized'
import { BlogPost } from '../types'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data: post, loading } = usePublicData<BlogPost>(`/api/blog/${slug}`)

  if (loading) return <div style={{ padding: '80px 32px', textAlign: 'center' }}>{t('common.loading')}</div>
  if (!post) return <div style={{ padding: '80px 32px', textAlign: 'center' }}>Post not found</div>

  return (
    <div className="pub-section" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link to="/blog" style={{ color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        ← {t('common.back')}
      </Link>
      {post.category && <span className="pub-card__tag">{post.category}</span>}
      <h1 className="pub-section-title" style={{ marginTop: 8 }}>{localize(post.title)}</h1>
      {post.published_at && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
          {t('blog.published')}: {new Date(post.published_at).toLocaleDateString()}
        </p>
      )}
      {post.cover_url && (
        <img src={post.cover_url} alt={localize(post.title)} style={{ width: '100%', borderRadius: 16, marginBottom: 40, aspectRatio: '16/9', objectFit: 'cover' }} />
      )}
      <div
        style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: localize(post.body) }}
      />
    </div>
  )
}
