import React from 'react';

/**
 * ProductEmptyState
 * Clean, professional empty state for when there are zero digital products in the catalog.
 */
export default function ProductEmptyState() {
  return (
    <div className="product-empty-state" role="status" aria-label="No products available">
      <div className="product-empty-state__icon-wrap font-mono" aria-hidden="true">
        <span className="product-empty-state__dot" />
        <span>CATALOG EMPTY</span>
      </div>

      <h3 className="product-empty-state__heading">
        No products yet.
      </h3>

      <p className="product-empty-state__text">
        I'm working on practical resources and developer-focused materials. New resources will appear here when they are ready.
      </p>

      <p className="product-empty-state__subtle font-mono">
        Built from real project experience, not filler content.
      </p>
    </div>
  );
}
