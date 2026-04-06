import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'

import PublicLayout from './components/layout/PublicLayout'
import HomePage from './pages/HomePage'

// Admin pages (existing)
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import PanelsPage from './pages/admin/PanelsPage'
import StoreSettingsPage from './pages/admin/StoreSettingsPage'
import LeadsPage from './pages/admin/LeadsPage'

// Public pages — lazy loaded for performance
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const DesignersPage = lazy(() => import('./pages/DesignersPage'))
const DesignerDetailPage = lazy(() => import('./pages/DesignerDetailPage'))
const DealersPage = lazy(() => import('./pages/DealersPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const InstallationPage = lazy(() => import('./pages/InstallationPage'))
const PartnersPage = lazy(() => import('./pages/PartnersPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

// New admin pages
const AdminHeroSlidesPage = lazy(() => import('./pages/admin/AdminHeroSlidesPage'))
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'))
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'))
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage'))
const AdminDesignersPage = lazy(() => import('./pages/admin/AdminDesignersPage'))
const AdminDealersPage = lazy(() => import('./pages/admin/AdminDealersPage'))
const AdminPartnersPage = lazy(() => import('./pages/admin/AdminPartnersPage'))
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage'))
const AdminPagesPage = lazy(() => import('./pages/admin/AdminPagesPage'))

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}
    >
      Loading...
    </div>
  )
}

import type { Variants } from 'framer-motion'
const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  // Use top-level segment as key so /admin/* sub-routes don't remount AdminLayout
  const animKey = '/' + location.pathname.split('/')[1]
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={animKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location}>
          {/* ── Public website ──────────────────────────── */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />

          <Route
            path="/products"
            element={
              <PublicLayout>
                <ProductsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/products/:id"
            element={
              <PublicLayout>
                <ProductDetailPage />
              </PublicLayout>
            }
          />

          <Route
            path="/projects"
            element={
              <PublicLayout>
                <ProjectsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/projects/:slug"
            element={
              <PublicLayout>
                <ProjectDetailPage />
              </PublicLayout>
            }
          />

          <Route
            path="/gallery"
            element={
              <PublicLayout>
                <GalleryPage />
              </PublicLayout>
            }
          />

          <Route
            path="/designers"
            element={
              <PublicLayout>
                <DesignersPage />
              </PublicLayout>
            }
          />
          <Route
            path="/designers/:slug"
            element={
              <PublicLayout>
                <DesignerDetailPage />
              </PublicLayout>
            }
          />

          <Route
            path="/dealers"
            element={
              <PublicLayout>
                <DealersPage />
              </PublicLayout>
            }
          />

          <Route
            path="/about"
            element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            }
          />

          <Route
            path="/blog"
            element={
              <PublicLayout>
                <BlogPage />
              </PublicLayout>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <PublicLayout>
                <BlogPostPage />
              </PublicLayout>
            }
          />

          <Route
            path="/installation"
            element={
              <PublicLayout>
                <InstallationPage />
              </PublicLayout>
            }
          />
          <Route
            path="/partners"
            element={
              <PublicLayout>
                <PartnersPage />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <ContactPage />
              </PublicLayout>
            }
          />

          {/* ── Admin panel ─────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/panels" replace />} />
            <Route path="panels" element={<PanelsPage />} />
            <Route path="settings" element={<StoreSettingsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="hero-slides" element={<AdminHeroSlidesPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="designers" element={<AdminDesignersPage />} />
            <Route path="dealers" element={<AdminDealersPage />} />
            <Route path="partners" element={<AdminPartnersPage />} />
            <Route path="team" element={<AdminTeamPage />} />
            <Route path="pages" element={<AdminPagesPage />} />
          </Route>

          {/* ── Catch-all redirect ───────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="bottom-center"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font)',
            fontSize: 'var(--text-sm)',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}
