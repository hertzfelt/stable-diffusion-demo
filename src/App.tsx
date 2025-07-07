import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TextToImagePage from './pages/TextToImagePage';
import InpaintingPage from './pages/InpaintingPage';
import GalleryPage from './pages/GalleryPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Layout>
        <SignedIn>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/text-to-image" element={<TextToImagePage />} />
            <Route path="/inpainting" element={<InpaintingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SignedIn>
        <SignedOut>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SignedOut>
      </Layout>
    </Router>
  );
}

export default App
