import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';

// Lazy-loaded Public Routes (Loaded on-demand to optimize initial bundle size)
const AboutPage = lazy(() => import('./pages/AboutPage'));
const JourneyPage = lazy(() => import('./pages/JourneyPage'));
const BuildingPage = lazy(() => import('./pages/BuildingPage'));
const WorkPage = lazy(() => import('./pages/WorkPage'));
const FederatedLearningCaseStudyPage = lazy(() => import('./pages/FederatedLearningCaseStudyPage'));
const HotelManagementCaseStudyPage = lazy(() => import('./pages/HotelManagementCaseStudyPage'));
const CaseStudyPlaceholderPage = lazy(() => import('./pages/CaseStudyPlaceholderPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const LabPage = lazy(() => import('./pages/LabPage'));
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage'));
const BehindTheBuildPage = lazy(() => import('./pages/BehindTheBuildPage'));
const DigitalProductsPage = lazy(() => import('./pages/DigitalProductsPage'));
const BuildStatsPage = lazy(() => import('./pages/BuildStatsPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const StartProjectPage = lazy(() => import('./pages/StartProjectPage'));
const ProjectAssistantPage = lazy(() => import('./pages/ProjectAssistantPage'));
const AIProjectAssistantPage = lazy(() => import('./pages/AIProjectAssistantPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy-loaded Client Dashboard
const ClientDashboardPage = lazy(() => import('./pages/client/ClientDashboardPage'));

// Lazy-loaded Admin Layout & Management Routes (Fully isolated bundle)
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminProjectRequestsPage = lazy(() => import('./pages/admin/AdminProjectRequestsPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

/**
 * Route Loading Fallback
 * Lightweight, accessible placeholder matching the warm off-white canvas.
 */
function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            border: '2.5px solid var(--border-default, #e2e8f0)',
            borderTopColor: 'var(--accent-primary, #2563eb)',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
          }}
        />
        <span
          className="font-mono"
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted, #94a3b8)',
            letterSpacing: '0.06em',
          }}
        >
          LOADING...
        </span>
      </div>
    </div>
  );
}

/**
 * Main Application Component
 * Configures client-side routing with code-split route boundaries,
 * public layout shell, and isolated admin dashboard.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteSettingsProvider>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              {/* Public Website Routes (rendered within RootLayout with public Navbar & Footer) */}
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="about/journey" element={<JourneyPage />} />
                <Route path="building" element={<BuildingPage />} />
                <Route path="work" element={<WorkPage />} />
                <Route path="work/federated-learning-6g" element={<FederatedLearningCaseStudyPage />} />
                <Route path="work/luxury-hotel-management" element={<HotelManagementCaseStudyPage />} />
                <Route path="work/:projectId" element={<CaseStudyPlaceholderPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<BlogPostPage />} />
                <Route path="lab" element={<LabPage />} />
                <Route path="playground" element={<PlaygroundPage />} />
                <Route path="behind-the-build" element={<BehindTheBuildPage />} />
                <Route path="digital-products" element={<DigitalProductsPage />} />
                <Route path="build-stats" element={<BuildStatsPage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="start-a-project" element={<StartProjectPage />} />
                <Route path="project-assistant" element={<ProjectAssistantPage />} />
                <Route path="ai-project-assistant" element={<AIProjectAssistantPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="pricing" element={<PricingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Client Dashboard (Private authenticated workspace for normal users; NO public navbar) */}
              <Route path="/dashboard" element={<ClientDashboardPage />} />

              {/* Admin Login Gateway (Standalone view; NO public navbar) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Dashboard Routes (Dedicated AdminLayout; NO public navbar) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="project-requests" element={<AdminProjectRequestsPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
