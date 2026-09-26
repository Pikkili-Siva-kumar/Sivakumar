import React from 'react';
import ProductCard from './ProductCard';
import ProductEmptyState from './ProductEmptyState';

/**
 * ProductGrid
 * Renders either the responsive catalog grid of ProductCard components
 * or the ProductEmptyState if the product array is empty.
 */
export default function ProductGrid({ products = [] }) {
  if (!products || products.length === 0) {
    return <ProductEmptyState />;
  }

  return (
    <div className="product-grid" role="region" aria-label="Digital Products Catalog">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
