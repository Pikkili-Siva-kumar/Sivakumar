import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import ProductGrid from '../components/digitalProducts/ProductGrid';
import {
  DIGITAL_PRODUCTS,
  PRODUCT_CATEGORIES,
  HOW_IT_WORKS_STEPS,
} from '../data/digitalProducts';

import '../components/digitalProducts/DigitalProducts.css';
import './DigitalProductsPage.css';

/**
 * DigitalProductsPage
 * Step 32: Build the Digital Products Feature
 *
 * Professional catalog for practical digital resources, checklists, and templates
 * created from real project and learning experience.
 * Seeded with an empty catalog; displays clean empty state when no products exist.
 */
export default function DigitalProductsPage() {
  useEffect(() => {
    document.title = 'Digital Products & Resources | Siva Kumar';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="digital-products-page">
      <Container size="default">
        {/* PAGE HERO */}
        <header className="products-hero" aria-labelledby="products-hero-title">
          <div className="products-hero__badge font-mono">
            <span className="products-hero__badge-dot" aria-hidden="true" />
            <span>DIGITAL PRODUCTS</span>
          </div>

          <h1 id="products-hero-title" className="products-hero__title">
            Useful Things I've Built.
          </h1>

          <p className="products-hero__subheading">
            Practical resources, templates, and developer-focused materials created from real project and learning experience.
          </p>

          <p className="products-hero__supporting font-mono">
            Resources will appear here as they become available.
          </p>
        </header>

        {/* SECTION 1 — PRODUCT CATALOG */}
        <section className="products-page-section" aria-labelledby="heading-available-resources">
          <div className="products-section-head">
            <span className="products-accent-bar" aria-hidden="true" />
            <h2 id="heading-available-resources" className="products-section-title">
              Available Resources
            </h2>
            <p className="products-section-subtitle">
              Current releases and practical developer downloads.
            </p>
          </div>

          <ProductGrid products={DIGITAL_PRODUCTS} />
        </section>

        {/* SECTION 2 — WHAT MAY APPEAR HERE */}
        <section className="products-page-section" aria-labelledby="heading-what-youll-find">
          <div className="products-section-head">
            <span className="products-accent-bar" aria-hidden="true" />
            <h2 id="heading-what-youll-find" className="products-section-title">
              What You'll Find Here
            </h2>
            <p className="products-section-subtitle">
              Categories of practical materials planned for release as real project components are packaged.
            </p>
          </div>

          <div className="products-categories-grid" role="region" aria-label="Planned Resource Categories">
            {PRODUCT_CATEGORIES.map((cat, idx) => (
              <article key={cat.id} className="products-category-card">
                <span className="products-category-card__num font-mono">
                  TYPE 0{idx + 1}
                </span>
                <h3 className="products-category-card__title">
                  {cat.title}
                </h3>
                <p className="products-category-card__desc">
                  {cat.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 3 — HOW IT WORKS */}
        <section className="products-page-section" aria-labelledby="heading-how-it-works">
          <div className="products-section-head">
            <span className="products-accent-bar" aria-hidden="true" />
            <h2 id="heading-how-it-works" className="products-section-title">
              Simple, Useful, Practical.
            </h2>
            <p className="products-section-subtitle">
              A straightforward process focused on utility and execution.
            </p>
          </div>

          <div className="products-steps-grid" role="region" aria-label="How Resources Work">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div key={item.number} className="products-step-card">
                <span className="products-step-card__num font-mono">
                  {item.number}
                </span>
                <h3 className="products-step-card__title">
                  {item.title}
                </h3>
                <p className="products-step-card__desc">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4 — FUTURE-READY PRODUCT MODEL NOTE */}
        <section className="products-page-section" aria-label="Release Principles">
          <div className="products-principles-card">
            <div className="products-principles-card__content">
              <span className="products-principles-card__label font-mono">
                ENGINEERING STANDARDS
              </span>
              <h3 className="products-principles-card__title">
                Grounded in Real Code.
              </h3>
              <p className="products-principles-card__text">
                Every resource released here will be derived directly from verified production code, actual project architecture, and battle-tested workflows—never generic placeholder content or rehashed documentation.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5 — CTA */}
        <section className="products-page-section products-cta-section" aria-labelledby="heading-products-cta">
          <div className="products-cta-card">
            <span className="products-accent-bar" aria-hidden="true" />
            <h2 id="heading-products-cta" className="products-cta__heading">
              Have a Resource Idea?
            </h2>
            <p className="products-cta__text">
              Have an idea for a useful developer resource or something you'd like to see built?
            </p>
            <div className="products-cta__actions">
              <Link to="/contact" className="products-action-btn products-action-btn--primary">
                Suggest a Resource →
              </Link>
              <Link to="/start-a-project" className="products-action-btn products-action-btn--secondary">
                Start a Project →
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
