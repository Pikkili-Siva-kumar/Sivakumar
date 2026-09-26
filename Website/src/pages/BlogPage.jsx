import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../services/api';
import './Blog.css';

function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch published blog posts from API
  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (selectedCategory) params.category = selectedCategory;

    blogApi
      .getAll(params)
      .then((res) => {
        if (isMounted) {
          if (res && Array.isArray(res.posts)) {
            setPosts(res.posts);
          } else {
            setPosts([]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPosts([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  // Extract unique categories from all posts
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  );

  // Separate featured post if present
  const featuredPost = posts.find((p) => p.featured) || null;
  const regularPosts = featuredPost
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  return (
    <div className="site-canvas">
      <div className="site-canvas__grid" aria-hidden="true" />

      <main className="site-main container">
        <div className="blog-page">
          {/* Header */}
          <header className="blog-page__header">
            <div className="blog-page__eyebrow badge badge--accent font-mono">
              <span className="blog-page__eyebrow-dot" aria-hidden="true" />
              <span>WRITING & INSIGHTS</span>
            </div>

            <h1 className="blog-page__title">Thoughts, Notes & Engineering.</h1>

            <p className="blog-page__lead">
              Practical technical articles, architectural patterns, and notes on building reliable, structured software systems.
            </p>
          </header>

          {/* Category Filter Pills (if categories available) */}
          {categories.length > 0 && (
            <div className="blog-category-bar" role="navigation" aria-label="Category filter">
              <button
                type="button"
                className={`blog-category-pill ${!selectedCategory ? 'blog-category-pill--active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All Articles
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`blog-category-pill ${selectedCategory === cat ? 'blog-category-pill--active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          {loading ? (
            <div className="blog-empty">
              <p className="blog-empty__title">Loading articles...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="blog-empty">
              <div className="blog-empty__icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h2 className="blog-empty__title">No articles published yet</h2>
              <p className="blog-empty__desc">
                {selectedCategory
                  ? `No published articles in "${selectedCategory}". Select another category or check back soon.`
                  : 'Technical writings, development notes, and engineering case studies will be published here soon.'}
              </p>
              {selectedCategory && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCategory('')}
                  style={{ marginTop: 'var(--space-2)' }}
                >
                  View All Articles
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Featured Post (if one is marked featured) */}
              {featuredPost && (
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="blog-featured-card"
                  aria-label={`Read featured article: ${featuredPost.title}`}
                >
                  <div className="blog-featured-card__top">
                    <span className="blog-featured-tag">★ Featured Article</span>
                    <span className="blog-meta-date">{formatDate(featuredPost.published_at)}</span>
                  </div>

                  <h2 className="blog-featured-card__title">{featuredPost.title}</h2>

                  {featuredPost.excerpt && (
                    <p className="blog-featured-card__excerpt">{featuredPost.excerpt}</p>
                  )}

                  <div className="blog-featured-card__footer">
                    {featuredPost.category ? (
                      <span className="blog-card__category">{featuredPost.category}</span>
                    ) : (
                      <span />
                    )}
                    <span className="blog-read-link">
                      Read Article <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              )}

              {/* Regular Posts Grid */}
              {regularPosts.length > 0 && (
                <div className="blog-grid">
                  {regularPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="blog-card"
                      aria-label={`Read article: ${post.title}`}
                    >
                      <div className="blog-card__header">
                        {post.category ? (
                          <span className="blog-card__category">{post.category}</span>
                        ) : (
                          <span />
                        )}
                        <span className="blog-meta-date">{formatDate(post.published_at)}</span>
                      </div>

                      <h3 className="blog-card__title">{post.title}</h3>

                      {post.excerpt ? (
                        <p className="blog-card__excerpt">{post.excerpt}</p>
                      ) : (
                        <p className="blog-card__excerpt">
                          {post.content.slice(0, 160)}...
                        </p>
                      )}

                      <div className="blog-card__footer">
                        <span className="blog-read-link">
                          Read Article <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
