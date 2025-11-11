import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CarsList from './pages/CarsList';
import CarForm from './pages/CarForm';
import CarDetail from './pages/CarDetail';
import ClientsList from './pages/ClientsList';
import ClientForm from './pages/ClientForm';
import ClientDetail from './pages/ClientDetail';
import ImportsList from './pages/ImportsList';
import ImportForm from './pages/ImportForm';
import ImportDetail from './pages/ImportDetail';
import ShareView from './pages/ShareView';
import './App.css';

function Navbar() {
  const location = useLocation();
  const isShareView = location.pathname.startsWith('/share/');

  // No mostrar navbar en la vista pública de compartir
  if (isShareView) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-title">Sistema de Importaciones</h1>
        <div className="nav-links">
          <Link to="/imports" className="nav-link">Importaciones</Link>
          <Link to="/cars" className="nav-link">Autos</Link>
          <Link to="/clients" className="nav-link">Clientes</Link>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const isShareView = location.pathname.startsWith('/share/');

  return (
    <div className="app">
      <Navbar />
      <main className={isShareView ? "share-main-content" : "main-content"}>
        <Routes>
          <Route path="/" element={<ImportsList />} />
          
          {/* Cars Routes */}
          <Route path="/cars" element={<CarsList />} />
          <Route path="/cars/new" element={<CarForm />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/cars/:id/edit" element={<CarForm />} />
          
          {/* Clients Routes */}
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />
          
          {/* Imports Routes */}
          <Route path="/imports" element={<ImportsList />} />
          <Route path="/imports/new" element={<ImportForm />} />
          <Route path="/imports/:id" element={<ImportDetail />} />
          <Route path="/imports/:id/edit" element={<ImportForm />} />
          
          {/* Share Route (Public) */}
          <Route path="/share/:token" element={<ShareView />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
