import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Droplet, ShieldCheck, User as UserIcon, List, AlertTriangle, Map as MapIcon, LayoutDashboard } from 'lucide-react';

// Components
import MapDisplay from './components/Map/MapDisplay';
import ContextPanel from './components/Sidebar/ContextPanel';
import CrisisInsights from './components/Analytics/CrisisInsights';

// Context
import { useCrisisContext } from './context/CrisisContext';
import './App.css';

function Navigation() {
  const loc = useLocation();
  return (
    <nav className="nav-controls">
      <Link to="/" className={`nav-btn ${loc.pathname === '/' ? 'active' : ''}`}>
        <UserIcon size={18} /> <span>Citizen</span>
      </Link>
      <Link to="/admin" className={`nav-btn ${loc.pathname === '/admin' ? 'active' : ''}`}>
        <ShieldCheck size={18} /> <span>Admin</span>
      </Link>
    </nav>
  );
}

function App() {
  const { loading, areas } = useCrisisContext();
  const [selectedRegionId, setSelectedRegionId] = useState(null);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1d' }}>
        <div style={{ textAlign: 'center' }}>
          <Droplet size={60} color="#3b82f6" className="animate-bounce" />
          <h2 style={{ color: 'white', marginTop: '20px', letterSpacing: '2px' }}>CRISISCHAIN AI</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="dashboard-layout">
        <header className="layout-topbar">
          <Link to="/" className="logo-link">
            <Droplet size={28} color="#3b82f6" />
            <h1>CrisisChain AI</h1>
          </Link>
          <Navigation />
        </header>

        <Routes>
          {/* CITIZEN PORTAL - CENTERED CARD VIEW */}
          <Route path="/" element={
            <div className="citizen-portal-container">
              <div className="citizen-main-card animate-fade-in">
                <ContextPanel 
                  regionId={selectedRegionId} 
                  onSetRegionId={setSelectedRegionId} 
                  onReportCreated={(id) => setSelectedRegionId(id)}
                  forceMode="citizen" 
                />
              </div>
            </div>
          } />

          {/* ADMIN PANEL - UNIFIED 2-COLUMN COMMAND CENTER */}
          <Route path="/admin" element={
            <div className="admin-layout-wrapper">
              
              {/* LEFT: REPORT QUEUE */}
              <aside className="admin-sidebar-list">
                <div className="list-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#94a3b8' }}>
                    <List size={18}/> ACTIVE QUEUE
                  </h3>
                </div>
                <div className="report-items" style={{ overflowY: 'auto' }}>
                  {areas.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>No active reports</p>}
                  {areas.map(report => (
                    <div 
                      key={report.id} 
                      className={`admin-report-card ${selectedRegionId === report.id ? 'active' : ''}`}
                      onClick={() => setSelectedRegionId(report.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ margin: 0 }}>{report.name}</strong>
                        <span className={`prio-tag ${report.priority?.toLowerCase()}`}>
                          {report.priority}
                        </span>
                      </div>
                      <p className="description-preview">{report.description}</p>
                      <div className="card-footer">
                         <span className={`status-pill ${report.status}`}>{report.status}</span>
                         <span className="time-ago">ID: {report.id.slice(0, 6)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>

              {/* RIGHT: ACTION CENTER */}
              <main className="admin-action-center">
                {!selectedRegionId ? (
                  <div className="insights-full-view" style={{ flex: 1 }}>
                     <CrisisInsights />
                  </div>
                ) : (
                  <div className="split-detail-view animate-fade-in">
                    <div className="detail-map-box">
                      <MapDisplay onRegionSelect={(reg) => setSelectedRegionId(reg.id)} />
                      <button className="btn-close-detail" onClick={() => setSelectedRegionId(null)} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div className="detail-command-box">
                       <ContextPanel 
                         regionId={selectedRegionId} 
                         onSetRegionId={setSelectedRegionId} 
                         forceMode="admin" 
                       />
                    </div>
                  </div>
                )}
              </main>

            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
