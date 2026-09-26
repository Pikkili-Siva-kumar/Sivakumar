import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogApi } from '../services/api';
import { trackEvent } from '../utils/analytics';
import './Blog.css';

function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Scroll to top on mount or slug change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch article by slug
  useEffect(() => {
    let isMounted = true;

    blogApi
      .getBySlug(slug)
      .then((res) => {
        if (isMounted) {
          if (res && res.post) {
            setPost(res.post);
            setNotFound(false);
            trackEvent({
              eventType: 'blog_view',
              path: `/blog/${slug}`,
              metadata: { slug },
            });
          } else {
            setNotFound(true);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="site-canvas">
        <div className="site-canvas__grid" aria-hidden="true" />
        <main className="site-main container">
          <div className="blog-detail">
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-12)' }}>
              Loading article...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="site-canvas">
        <div className="site-canvas__grid" aria-hidden="true" />
        <main className="site-main container">
          <div className="blog-detail">
            <Link to="/blog" className="blog-detail__back-link">
              ← Back to all articles
            </Link>

            <div className="blog-empty" style={{ marginTop: 'var(--space-6)' }}>
              <h1 className="blog-empty__title">Article Not Found</h1>
              <p className="blog-empty__desc">
                The requested article could not be found, or it may currently be saved as a draft.
              </p>
              <Link to="/blog" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                Return to Blog
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Split content by paragraphs or preserve spacing
  const paragraphs = post.content.split(/\n{2,}/);

  return (
    <div className="site-canvas">
      <div className="site-canvas__grid" aria-hidden="true" />

      <main className="site-main container">
        <article className="blog-detail">
          {/* Back to Blog */}
          <div>
            <Link to="/blog" className="blog-detail__back-link">
              ← Back to all articles
            </Link>
          </div>

          {/* Article Header */}
          <header className="blog-detail__header">
            <div className="blog-detail__meta">
              {post.category && (
                <span className="blog-card__category">{post.category}</span>
              )}
              {post.featured && (
                <span className="blog-featured-tag">★ Featured</span>
              )}
              <span className="blog-meta-date">
                Published on {formatDate(post.published_at)}
              </span>
            </div>

            <h1 className="blog-detail__title">{post.title}</h1>

            {post.excerpt && (
              <p className="blog-page__lead" style={{ fontStyle: 'italic' }}>
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Optional Cover Image */}
          {post.cover_image_url && (
            <div className="blog-detail__cover-img-wrapper">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="blog-detail__cover-img"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="blog-detail__body">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="blog-detail__paragraph">
                {p}
              </p>
            ))}
          </div>

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="blog-detail__tags-section">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                TAGS:
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="blog-detail__tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Navigation */}
          <footer className="blog-detail__footer">
            <Link to="/blog" className="btn btn-secondary">
              ← Back to all articles
            </Link>
          </footer>
        </article>
      </main>
    </div>
  );
}
