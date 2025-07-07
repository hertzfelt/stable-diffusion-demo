import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import TextToImagePage from './pages/TextToImagePage';
import InpaintingPage from './pages/InpaintingPage';
import GalleryPage from './pages/GalleryPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/text-to-image" element={<TextToImagePage />} />
          <Route path="/inpainting" element={<InpaintingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App
