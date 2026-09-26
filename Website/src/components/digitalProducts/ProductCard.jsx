import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ProductCard
 * Future-ready product card component.
 * Dynamically supports Download, External Resource, or Internal View Details
 * based on product fields.
 */
export default function ProductCard({ product }) {
  if (!product) return null;

  const {
    title,
    category,
    shortDescription,
    format,
    technologies = [],
    status = 'free',
    price,
    downloadUrl,
    externalUrl,
    slug,
    featured = false,
  } = product;

  const isFree = status === 'free';

  // Determine dynamic CTA button
  const renderAction = () => {
    if (downloadUrl) {
      return (
        <a
          href={downloadUrl}
          className="product-card__btn product-card__btn--download"
          download
        >
          Download ({format || 'Resource'}) ↓
        </a>
      );
    }

    if (externalUrl) {
      return (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="product-card__btn product-card__btn--external"
        >
          View Resource ↗
        </a>
      );
    }

    if (slug) {
      return (
        <Link
          to={`/digital-products/${slug}`}
          className="product-card__btn product-card__btn--details"
        >
          View Details →
        </Link>
      );
    }

    return (
      <span className="product-card__btn product-card__btn--disabled">
        Available Soon
      </span>
    );
  };

  return (
    <article
      className={`product-card ${featured ? 'product-card--featured' : ''}`}
      aria-labelledby={`product-title-${product.id}`}
    >
      <div className="product-card__top">
        <span className="product-card__category font-mono">
          {category || 'Resource'}
        </span>

        <div className="product-card__badges">
          {featured && (
            <span className="product-badge product-badge--featured font-mono">
              FEATURED
            </span>
          )}
          <span className={`product-badge product-badge--${isFree ? 'free' : 'paid'} font-mono`}>
            {isFree ? 'FREE' : price || 'PAID'}
          </span>
        </div>
      </div>

      <h3 id={`product-title-${product.id}`} className="product-card__title">
        {title}
      </h3>

      <p className="product-card__desc">
        {shortDescription}
      </p>

      {format && (
        <div className="product-card__format font-mono">
          <span className="product-card__format-label">FORMAT:</span>
          <span>{format}</span>
        </div>
      )}

      {technologies.length > 0 && (
        <div className="product-card__tags" aria-label="Technologies">
          {technologies.map((tech) => (
            <span key={tech} className="product-card__tag font-mono">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="product-card__footer">
        {renderAction()}
      </div>
    </article>
  );
}
