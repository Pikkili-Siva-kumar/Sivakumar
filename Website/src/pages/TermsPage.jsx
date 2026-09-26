import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/useSiteSettings';
import './TermsPage.css';

/**
 * TermsPage Component
 * Route: /terms
 * Step 42: Privacy Policy & Terms of Use
 *
 * Factual, plain-language terms of use governing access to the website,
 * project inquiries, AI assistant tools, and intellectual property.
 */
export default function TermsPage() {
  const { settings } = useSiteSettings();
  const contactEmail = settings?.contact_email || 'pikkilisivakumar07@gmail.com';

  useEffect(() => {
    window.scrollTo(0, 0);
    const originalTitle = document.title;
    document.title = 'Terms of Use | Siva Kumar';

    const metaTag = document.querySelector('meta[name="description"]');
    const originalMeta = metaTag ? metaTag.getAttribute('content') : '';
    if (metaTag) {
      metaTag.setAttribute(
        'content',
        'Terms of use governing access to the Siva Kumar website, project inquiries, AI assistant tools, intellectual property, and user responsibilities.'
      );
    }

    return () => {
      document.title = originalTitle;
      if (metaTag && originalMeta) {
        metaTag.setAttribute('content', originalMeta);
      }
    };
  }, []);

  return (
    <div className="terms-page">
      <div className="terms-container">
        <header className="terms-header">
          <div className="terms-eyebrow">
            <span className="terms-eyebrow-dot" aria-hidden="true" />
            <span>LEGAL & COMPLIANCE</span>
          </div>
          <h1 className="terms-title">Terms of Use</h1>
          <div className="terms-meta">
            <span className="terms-meta-item">
              <strong>Effective Date:</strong> September 2026
            </span>
            <span className="terms-meta-item">&bull;</span>
            <span className="terms-meta-item">
              <strong>Applies To:</strong> All Visitors & Registered Users
            </span>
          </div>
        </header>

        <article className="terms-card">
          <p className="terms-intro">
            These Terms of Use govern your access to and use of this personal-brand and professional
            engineering website, including all case studies, articles, interactive tools, project
            request workflows, and client dashboard features. By browsing or utilizing this site,
            you agree to these Terms.
          </p>

          {/* 1. Use of Website */}
          <section className="terms-section" aria-labelledby="terms-use">
            <h2 id="terms-use" className="terms-section-title">
              <span className="terms-section-number">01</span>
              Use of the Website
            </h2>
            <p className="terms-paragraph">
              This website serves as a professional portfolio, knowledge base, and direct communication
              portal for Siva Kumar. You may access the public sections of the site to review work,
              read technical articles, experiment with interactive showcase tools, and submit project
              inquiries for potential consulting or engineering engagements.
            </p>
          </section>

          {/* 2. Project Inquiries & Submissions */}
          <section className="terms-section" aria-labelledby="terms-inquiries">
            <h2 id="terms-inquiries" className="terms-section-title">
              <span className="terms-section-number">02</span>
              Project Inquiries & Non-Binding Nature
            </h2>
            <p className="terms-paragraph">
              The website provides interactive forms (such as the Project Builder and Project Assistant)
              enabling prospective clients to outline requirements and initiate dialogue.
            </p>
            <div className="terms-callout terms-callout-warning">
              <strong>No Contractual Commitment:</strong> Submitting a project inquiry or project request does not automatically create a contract, payment obligation, project acceptance, or delivery commitment. All engagements require mutual discussion, scope definition, and explicit written agreement before any commercial engagement or engineering work begins.
            </div>
            <p className="terms-paragraph">
              We reserve the right to accept, decline, or prioritize project inquiries based on current availability, technical alignment, and scheduling constraints.
            </p>
          </section>

          {/* 3. Project Content & User Submissions */}
          <section className="terms-section" aria-labelledby="terms-content">
            <h2 id="terms-content" className="terms-section-title">
              <span className="terms-section-number">03</span>
              User Submissions & Materials
            </h2>
            <p className="terms-paragraph">
              When submitting project briefs, contact messages, or requirements:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">
                You retain all rights to your original ideas, proprietary documents, and business specifications.
              </li>
              <li className="terms-list-item">
                You confirm that you have the right to provide the information submitted and that it does not infringe on the intellectual property, trade secrets, or confidentiality agreements of any third party.
              </li>
              <li className="terms-list-item">
                You grant permission to review and process the submitted details solely for the purpose of assessing your request and communicating with you.
              </li>
            </ul>
          </section>

          {/* 4. AI Project Assistant */}
          <section className="terms-section" aria-labelledby="terms-ai">
            <h2 id="terms-ai" className="terms-section-title">
              <span className="terms-section-number">04</span>
              AI Assistant & Informational Output
            </h2>
            <p className="terms-paragraph">
              The website includes an AI Project Assistant powered by Google Gemini, intended to assist visitors in conceptualizing and structuring software ideas.
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">
                <strong>Informational Guidance:</strong> AI-generated suggestions, architecture recommendations, feature breakdowns, and budget/timeline estimations are strictly exploratory and informational. They should be independently reviewed and verified by engineering professionals before being treated as final specifications.
              </li>
              <li className="terms-list-item">
                <strong>Model Variability:</strong> Output is generated probabilistically by a third-party large language model and may occasionally produce incomplete, inaccurate, or outdated recommendations.
              </li>
              <li className="terms-list-item">
                <strong>Prohibited Inputs:</strong> You must not enter sensitive credentials, API keys, passwords, proprietary code under strict NDA, or personal financial details into conversational AI prompts.
              </li>
            </ul>
          </section>

          {/* 5. Intellectual Property */}
          <section className="terms-section" aria-labelledby="terms-ip">
            <h2 id="terms-ip" className="terms-section-title">
              <span className="terms-section-number">05</span>
              Intellectual Property Rights
            </h2>
            <p className="terms-paragraph">
              Unless otherwise noted, all content published on this website—including articles, original graphics, case study write-ups, site design, code demonstrations, and branding—is the intellectual property of Siva Kumar and is protected by applicable copyright and intellectual property laws.
            </p>
            <p className="terms-paragraph">
              Third-party product names, logos, technologies, and trademarks displayed on the site belong to their respective owners and are referenced solely for identification, educational, or descriptive purposes.
            </p>
          </section>

          {/* 6. Third-Party Services */}
          <section className="terms-section" aria-labelledby="terms-thirdparty">
            <h2 id="terms-thirdparty" className="terms-section-title">
              <span className="terms-section-number">06</span>
              Third-Party Integrations
            </h2>
            <p className="terms-paragraph">
              The website utilizes selected third-party services to support specific operational features, including Google Gemini for generative assistance and transactional SMTP providers for email communications. These services operate under their own terms and privacy practices.
            </p>
          </section>

          {/* 7. Service Availability & Disclaimers */}
          <section className="terms-section" aria-labelledby="terms-availability">
            <h2 id="terms-availability" className="terms-section-title">
              <span className="terms-section-number">07</span>
              Site Availability & Disclaimer
            </h2>
            <p className="terms-paragraph">
              This website and all associated tools are provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. While we strive to maintain reliable operations and accurate technical content:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">
                No warranty or guarantee is made that access will be uninterrupted, error-free, or permanently available.
              </li>
              <li className="terms-list-item">
                Features, demo showcases, or interactive tools may be updated, adjusted, or temporarily taken offline for maintenance without prior notice.
              </li>
              <li className="terms-list-item">
                No service-level agreements (SLAs), uptime guarantees, or formal warranties apply to public website browsing.
              </li>
            </ul>
          </section>

          {/* 8. External Links */}
          <section className="terms-section" aria-labelledby="terms-links">
            <h2 id="terms-links" className="terms-section-title">
              <span className="terms-section-number">08</span>
              External Links
            </h2>
            <p className="terms-paragraph">
              This site may contain links to external web properties, such as GitHub repositories, LinkedIn profiles, technical documentation, or research papers. These links are provided solely for convenience and reference. We do not endorse, monitor, or accept responsibility for the content, privacy practices, or availability of third-party websites.
            </p>
          </section>

          {/* 9. User Responsibilities */}
          <section className="terms-section" aria-labelledby="terms-responsibilities">
            <h2 id="terms-responsibilities" className="terms-section-title">
              <span className="terms-section-number">09</span>
              User Responsibilities & Acceptable Use
            </h2>
            <p className="terms-paragraph">
              When utilizing this website, you agree not to:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">
                Engage in automated scraping, excessive rapid requests, or denial-of-service behaviors that degrade site performance for other visitors.
              </li>
              <li className="terms-list-item">
                Attempt to bypass authentication, probe administrative interfaces without authorization, or exploit security vulnerabilities.
              </li>
              <li className="terms-list-item">
                Submit malicious code, cross-site scripting (XSS) payloads, SQL injection sequences, or fraudulent inquiry messages.
              </li>
              <li className="terms-list-item">
                Impersonate any individual or misrepresent your affiliation with any entity.
              </li>
            </ul>
          </section>

          {/* 10. Modifications to Terms */}
          <section className="terms-section" aria-labelledby="terms-modifications">
            <h2 id="terms-modifications" className="terms-section-title">
              <span className="terms-section-number">10</span>
              Changes to the Website & Terms
            </h2>
            <p className="terms-paragraph">
              We reserve the right to modify these Terms of Use at any time. Continued use of the website following any posted modifications constitutes acceptance of the updated terms. You are encouraged to review this page periodically to remain informed of any changes.
            </p>
          </section>

          {/* 11. Contact Information */}
          <section className="terms-section" aria-labelledby="terms-contact">
            <h2 id="terms-contact" className="terms-section-title">
              <span className="terms-section-number">11</span>
              Contact Information
            </h2>
            <p className="terms-paragraph">
              If you have any questions or clarifications regarding these Terms of Use, please reach out via:
            </p>
            <ul className="terms-list">
              <li className="terms-list-item">
                <strong>Email:</strong>{' '}
                <a href={`mailto:${contactEmail}`} className="terms-link">
                  {contactEmail}
                </a>
              </li>
              <li className="terms-list-item">
                <strong>Contact Form:</strong>{' '}
                <Link to="/contact" className="terms-link">
                  /contact
                </Link>
              </li>
            </ul>
          </section>

          {/* Cross-Link Footer */}
          <footer className="terms-footer-nav">
            <span>
              Need privacy details? Read our{' '}
              <Link to="/privacy" className="terms-link">
                Privacy Policy
              </Link>
              .
            </span>
            <Link to="/" className="terms-link">
              &larr; Back to Home
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
