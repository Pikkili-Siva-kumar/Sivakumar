import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/useSiteSettings';
import './PrivacyPage.css';

/**
 * PrivacyPage Component
 * Route: /privacy
 * Step 42: Privacy Policy & Terms of Use
 *
 * Factual, plain-language privacy documentation of data processed by this website.
 * Strictly adheres to verified application implementations.
 */
export default function PrivacyPage() {
  const { settings } = useSiteSettings();
  const contactEmail = settings?.contact_email || 'pikkilisivakumar07@gmail.com';

  useEffect(() => {
    window.scrollTo(0, 0);
    const originalTitle = document.title;
    document.title = 'Privacy Policy | Siva Kumar';

    const metaTag = document.querySelector('meta[name="description"]');
    const originalMeta = metaTag ? metaTag.getAttribute('content') : '';
    if (metaTag) {
      metaTag.setAttribute(
        'content',
        'Factual privacy policy explaining how account information, project inquiries, contact messages, analytics, and AI assistance are handled on the Siva Kumar website.'
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
    <div className="privacy-page">
      <div className="privacy-container">
        <header className="privacy-header">
          <div className="privacy-eyebrow">
            <span className="privacy-eyebrow-dot" aria-hidden="true" />
            <span>LEGAL & COMPLIANCE</span>
          </div>
          <h1 className="privacy-title">Privacy Policy</h1>
          <div className="privacy-meta">
            <span className="privacy-meta-item">
              <strong>Effective Date:</strong> September 2026
            </span>
            <span className="privacy-meta-item">&bull;</span>
            <span className="privacy-meta-item">
              <strong>Scope:</strong> Public Website & Client Workspace
            </span>
          </div>
        </header>

        <article className="privacy-card">
          <p className="privacy-intro">
            This Privacy Policy explains plainly and factually how this website collects, uses,
            and handles information when you visit, create an account, submit inquiries, or interact
            with features like the AI Project Assistant. This policy reflects only the functionality
            actually implemented on this site.
          </p>

          {/* 1. Account Information */}
          <section className="privacy-section" aria-labelledby="section-account">
            <h2 id="section-account" className="privacy-section-title">
              <span className="privacy-section-number">01</span>
              Account Information
            </h2>
            <p className="privacy-paragraph">
              When you register for an account to track project requests or collaborate, we collect:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <strong>Name:</strong> To identify you within project requests and dashboard communications.
              </li>
              <li className="privacy-list-item">
                <strong>Email Address:</strong> To serve as your login username, send transactional notifications, and facilitate password recovery.
              </li>
              <li className="privacy-list-item">
                <strong>Authentication Credentials:</strong> Your account password is converted into a salted, one-way cryptographic hash before storage. Plain-text passwords are never saved or accessible to administrators.
              </li>
              <li className="privacy-list-item">
                <strong>Account Metadata:</strong> Account creation date, update timestamp, assigned role (e.g., user), and account status.
              </li>
            </ul>
          </section>

          {/* 2. Project Requests */}
          <section className="privacy-section" aria-labelledby="section-projects">
            <h2 id="section-projects" className="privacy-section-title">
              <span className="privacy-section-number">02</span>
              Project Requests & Inquiries
            </h2>
            <p className="privacy-paragraph">
              When you submit a project brief through the Project Builder, Project Assistant, or dedicated request forms, we store the details provided to evaluate and respond to your inquiry:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <strong>Project Details:</strong> Project name, selected project type, scope, requirement descriptions, requested feature list, and additional notes.
              </li>
              <li className="privacy-list-item">
                <strong>Parameters:</strong> Estimated timeline, budget range, and technology preferences.
              </li>
              <li className="privacy-list-item">
                <strong>Contact Information:</strong> Your submitted name, email address, and optional phone number.
              </li>
            </ul>
          </section>

          {/* 3. Contact Messages */}
          <section className="privacy-section" aria-labelledby="section-contact">
            <h2 id="section-contact" className="privacy-section-title">
              <span className="privacy-section-number">03</span>
              Contact Messages
            </h2>
            <p className="privacy-paragraph">
              When you submit an inquiry through the Contact page, we record:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <strong>Sender Name & Email:</strong> Used exclusively to respond to your communication.
              </li>
              <li className="privacy-list-item">
                <strong>Subject & Message:</strong> The topic and message content you entered.
              </li>
              <li className="privacy-list-item">
                <strong>Submission Metadata:</strong> The date and time the message was received.
              </li>
            </ul>
          </section>

          {/* 4. Analytics */}
          <section className="privacy-section" aria-labelledby="section-analytics">
            <h2 id="section-analytics" className="privacy-section-title">
              <span className="privacy-section-number">04</span>
              First-Party Analytics
            </h2>
            <p className="privacy-paragraph">
              This website uses a lightweight, custom first-party analytics system to understand how visitors navigate content. We track only the following discrete interaction events:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <code>page_view</code>: When a public page is navigated to.
              </li>
              <li className="privacy-list-item">
                <code>project_view</code>: When a case study or project detail is viewed.
              </li>
              <li className="privacy-list-item">
                <code>blog_view</code>: When a technical article is read.
              </li>
              <li className="privacy-list-item">
                <code>project_request_submitted</code>: Recorded upon successful project request submission.
              </li>
              <li className="privacy-list-item">
                <code>contact_message_submitted</code>: Recorded upon successful contact form submission.
              </li>
            </ul>
            <p className="privacy-paragraph">
              Each event may record the destination path, HTTP referrer, a temporary browser session identifier, and non-sensitive contextual metadata. When an authenticated user triggers an action, internal identifiers may be associated where necessary for application operations.
            </p>
            <div className="privacy-callout">
              <strong>Admin Route Exclusion:</strong> All administrative paths (such as <code>/admin</code> and <code>/api/admin</code>) are strictly excluded from public analytics recording.
            </div>
          </section>

          {/* 5. AI Project Assistant */}
          <section className="privacy-section" aria-labelledby="section-ai">
            <h2 id="section-ai" className="privacy-section-title">
              <span className="privacy-section-number">05</span>
              AI Project Assistant (Google Gemini Integration)
            </h2>
            <p className="privacy-paragraph">
              The website offers an interactive AI Project Assistant powered by the Google Gemini API. When you engage with this tool:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                Your submitted natural language message and optional project context are transmitted over HTTPS to the configured Google Gemini API service provider to generate structured brief suggestions.
              </li>
              <li className="privacy-list-item">
                The prompt and resulting brief generated by the AI assistant are not intentionally stored permanently in this website&apos;s relational database unless you choose to submit it as a formal project request.
              </li>
            </ul>
            <div className="privacy-callout privacy-callout-warning">
              <strong>Sensitive Information Warning:</strong> Do not enter passwords, API keys, financial credentials, private encryption keys, or unnecessary confidential information into the assistant prompt. While automated filtering is applied to block recognizable credential strings, visitors are responsible for keeping sensitive secrets out of conversational prompts.
            </div>
            <p className="privacy-paragraph">
              Data handling by Google during API processing is governed by Google&apos;s standard API terms and privacy documentation. We make no representations regarding third-party model provider data retention practices beyond what Google publicly specifies for its developer API.
            </p>
          </section>

          {/* 6. Password Reset Flow */}
          <section className="privacy-section" aria-labelledby="section-reset">
            <h2 id="section-reset" className="privacy-section-title">
              <span className="privacy-section-number">06</span>
              Password Reset Mechanism
            </h2>
            <p className="privacy-paragraph">
              When a password reset is requested for a registered user account:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                A cryptographically secure, random 32-byte token is generated.
              </li>
              <li className="privacy-list-item">
                Only a SHA-256 hash of this token is stored in the database alongside a 30-minute expiration timestamp. The raw token is delivered exclusively to the account&apos;s email address.
              </li>
              <li className="privacy-list-item">
                Once a reset is completed, the token hash and expiration timestamp are immediately wiped to null, ensuring single-use protection.
              </li>
              <li className="privacy-list-item">
                Password reset requests utilize anti-enumeration responses to avoid revealing whether a given email address is registered on the platform.
              </li>
            </ul>
          </section>

          {/* 7. Email Notifications */}
          <section className="privacy-section" aria-labelledby="section-email">
            <h2 id="section-email" className="privacy-section-title">
              <span className="privacy-section-number">07</span>
              Email Notifications
            </h2>
            <p className="privacy-paragraph">
              When email delivery is enabled in server settings:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                Transactional emails are dispatched via standard SMTP to notify administrators of new contact inquiries and project requests.
              </li>
              <li className="privacy-list-item">
                Automated confirmation or acknowledgement emails may be sent to the email address provided in the inquiry form.
              </li>
              <li className="privacy-list-item">
                Password reset links are delivered to user accounts upon explicit request.
              </li>
            </ul>
          </section>

          {/* 8. Cookies & Local Storage */}
          <section className="privacy-section" aria-labelledby="section-storage">
            <h2 id="section-storage" className="privacy-section-title">
              <span className="privacy-section-number">08</span>
              Browser Storage & Cookies
            </h2>
            <p className="privacy-paragraph">
              This website does not use third-party marketing, advertising, or cross-site tracking cookies. We utilize standard client-side browser storage strictly for functional application state:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <strong>Local Storage (<code>auth_token</code>):</strong> Stores the signed JSON Web Token (JWT) when you sign in, enabling your session to stay active across browser tabs and visits until you log out.
              </li>
              <li className="privacy-list-item">
                <strong>Session Storage (<code>sk_analytics_session_id</code>):</strong> A temporary random string created in your browser tab to group navigation events within a single browsing session. It is automatically cleared when you close your browser tab.
              </li>
              <li className="privacy-list-item">
                <strong>Session Storage (<code>sk_assistant_welcome_dismissed</code>):</strong> Records whether you dismissed the floating AI assistant prompt during your current visit so it does not repeatedly reappear.
              </li>
            </ul>
          </section>

          {/* 9. Security Safeguards */}
          <section className="privacy-section" aria-labelledby="section-security">
            <h2 id="section-security" className="privacy-section-title">
              <span className="privacy-section-number">09</span>
              Security Practices
            </h2>
            <p className="privacy-paragraph">
              We implement industry-standard safeguards to protect data against unauthorized access, loss, or disclosure:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <strong>Password Protection:</strong> Passwords are protected using salted cryptographic hashes (Werkzeug security routines).
              </li>
              <li className="privacy-list-item">
                <strong>Access Control:</strong> Strict role checks and endpoint guards ensure administrative operations are restricted to verified administrators.
              </li>
              <li className="privacy-list-item">
                <strong>Tenant & User Isolation:</strong> Users can access only their own profile and project inquiries.
              </li>
              <li className="privacy-list-item">
                <strong>Token Protection:</strong> Sensitive tokens (such as password reset credentials) are hashed before database persistence and expire automatically.
              </li>
            </ul>
            <p className="privacy-paragraph">
              While we strive to employ reasonable security practices, no method of electronic storage or Internet transmission is 100% secure. Absolute security cannot be guaranteed.
            </p>
          </section>

          {/* 10. Data Retention */}
          <section className="privacy-section" aria-labelledby="section-retention">
            <h2 id="section-retention" className="privacy-section-title">
              <span className="privacy-section-number">10</span>
              Data Retention
            </h2>
            <p className="privacy-paragraph">
              Retention periods may vary depending on the type of information and the operational needs of the website.
            </p>
            <p className="privacy-paragraph">
              Account information and project inquiries are retained for as long as necessary to provide services, maintain project history, communicate regarding ongoing engagements, or fulfill legitimate business and recordkeeping requirements. Inactive or transient tokens (such as expired password reset entries) are purged according to system workflow rules.
            </p>
          </section>

          {/* 11. User Rights & Contact */}
          <section className="privacy-section" aria-labelledby="section-rights">
            <h2 id="section-rights" className="privacy-section-title">
              <span className="privacy-section-number">11</span>
              Your Inquiries & Contact
            </h2>
            <p className="privacy-paragraph">
              If you have questions regarding this Privacy Policy, wish to inquire about information you have submitted, or wish to request correction or removal of your user account, you can contact us directly:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <strong>Email:</strong>{' '}
                <a href={`mailto:${contactEmail}`} className="privacy-link">
                  {contactEmail}
                </a>
              </li>
              <li className="privacy-list-item">
                <strong>Contact Form:</strong> Available directly at{' '}
                <Link to="/contact" className="privacy-link">
                  /contact
                </Link>
              </li>
            </ul>
          </section>

          {/* 12. Updates */}
          <section className="privacy-section" aria-labelledby="section-updates">
            <h2 id="section-updates" className="privacy-section-title">
              <span className="privacy-section-number">12</span>
              Policy Updates
            </h2>
            <p className="privacy-paragraph">
              This policy may be updated when website functionality changes, new services are introduced, or legal considerations evolve. Any revisions will be reflected on this page with an updated effective date.
            </p>
          </section>

          {/* Cross-Link Footer */}
          <footer className="privacy-footer-nav">
            <span>
              Looking for our terms? Read the{' '}
              <Link to="/terms" className="privacy-link">
                Terms of Use
              </Link>
              .
            </span>
            <Link to="/" className="privacy-link">
              &larr; Back to Home
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
