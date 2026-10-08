import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TransitionProvider } from './context/TransitionContext';
import Preloader from './components/Preloader';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Seo from './components/Seo';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import News from './pages/News';

const About = lazy(() => import('./pages/About'));
const SubmitProject = lazy(() => import('./pages/SubmitProject'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminProjectEdit = lazy(() => import('./pages/admin/AdminProjectEdit'));
const AdminNewsEdit = lazy(() => import('./pages/admin/AdminNewsEdit'));

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Rektelier',
  description: 'Studio arsitektur',
};

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function AdminLayout() {
  return (
    <>
      <Seo title="Admin" noindex />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TransitionProvider>
          <Preloader />
          <Suspense fallback={null}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route
                  path="/"
                  element={
                    <>
                      <Seo
                        path="/"
                        description="Rektelier adalah studio arsitektur. Jelajahi proyek residensial, komersial, dan kompetisi kami."
                        jsonLd={orgJsonLd}
                      />
                      <Home />
                    </>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <>
                      <Seo
                        title="Proyek"
                        path="/projects"
                        description="Daftar proyek arsitektur Rektelier: residensial, komersial, dan kompetisi."
                      />
                      <Projects />
                    </>
                  }
                />
                <Route path="/project/:slug" element={<ProjectDetail />} />
                <Route
                  path="/news"
                  element={
                    <>
                      <Seo
                        title="News"
                        path="/news"
                        description="Berita dan kabar terbaru dari studio arsitektur Rektelier."
                      />
                      <News />
                    </>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <>
                      <Seo
                        title="About"
                        path="/about"
                        description="Tentang Rektelier: profil studio, tim, kontak, dan media sosial."
                      />
                      <About />
                    </>
                  }
                />
                <Route
                  path="/submit-project"
                  element={
                    <>
                      <Seo title="Submit" noindex />
                      <SubmitProject />
                    </>
                  }
                />
              </Route>

              <Route element={<AdminLayout />}>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
                <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
                <Route path="/admin/news" element={<ProtectedRoute><AdminNews /></ProtectedRoute>} />
                <Route path="/admin/projects/:id/edit" element={<ProtectedRoute><AdminProjectEdit /></ProtectedRoute>} />
                <Route path="/admin/news/:id/edit" element={<ProtectedRoute><AdminNewsEdit /></ProtectedRoute>} />
              </Route>
            </Routes>
          </Suspense>
        </TransitionProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}