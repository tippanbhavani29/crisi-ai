import { useState, useRef } from 'react';
import { 
  AlertCircle, CheckCircle, Truck, Bot, Activity, 
  Camera, X, Image as ImageIcon, MapPin, LayoutDashboard, ShieldAlert,
  Loader2, ArrowRight, History
} from 'lucide-react';
import { useCrisisContext } from '../../context/CrisisContext';
import './ContextPanel.css';

export default function ContextPanel({ regionId, onSetRegionId, forceMode, onReportCreated }) {
  const { 
    areas, reportIssue, dispatchTanker, 
    approveReport, resolveIssue, rejectReport, tankers 
  } = useCrisisContext();
  
  const [reportText, setReportText] = useState('');
  const [reportState, setReportState] = useState('idle');
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionMode, setRejectionMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const fileInputRef = useRef(null);
  
  const region = areas.find(a => a.id === regionId);

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        setReportText(prev => `${prev}\n📍 Location: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`.trim());
        setLocationLoading(false);
      }, () => setLocationLoading(false));
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReportState('analyzing');
    const newId = await reportIssue("Water Crisis Report", reportText, selectedImage);
    setReportState('complete');
    if (onReportCreated) onReportCreated(newId);
    setReportText('');
    setSelectedImage(null);
  };

  const handleAdminAction = async (actionFn, ...args) => {
    setProcessingId(region.id);
    try {
      await actionFn(...args);
    } finally {
      setProcessingId(null);
      setRejectionMode(false);
      setRejectionReason('');
    }
  };

  const renderCitizenView = () => (
    <div className="citizen-view">
      {!region ? (
        <div className="panel-section">
          <header className="citizen-header">
            <h3 className="section-title"><AlertCircle size={20} color="#3b82f6"/> Report Water Crisis</h3>
            <p className="subtitle">AI-powered emergency response system</p>
          </header>
          
          <form className="report-form" onSubmit={handleReportSubmit}>
            <div className="input-group">
              <textarea
                className="report-input"
                placeholder="Describe the issue... (e.g., Hospital in Sector 4 is out of water, pipe burst on Main St)"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                disabled={reportState === 'analyzing'}
                rows={4}
              />
              <div className="input-overlay-icons">
                 <Bot size={18} className={reportState === 'analyzing' ? 'animate-spin' : ''} />
              </div>
            </div>

            <div className="report-actions-row">
              <button type="button" className="action-icon-btn" onClick={detectLocation} disabled={locationLoading}>
                {locationLoading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />} 
                <span>{locationLoading ? 'Locating...' : 'Auto-Location'}</span>
              </button>
              <button type="button" className="action-icon-btn" onClick={() => fileInputRef.current.click()}>
                <Camera size={18} /> <span>{selectedImage ? 'Change Photo' : 'Add Photo'}</span>
              </button>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const r = new FileReader();
                r.onloadend = () => setSelectedImage(r.result);
                r.readAsDataURL(file);
              }} ref={fileInputRef} style={{ display: 'none' }} />
            </div>

            {selectedImage && (
              <div className="image-preview-container animate-fade-in">
                <img src={selectedImage} alt="Preview" />
                <button type="button" className="btn-remove-img" onClick={() => setSelectedImage(null)}><X size={14}/></button>
              </div>
            )}

            <button type="submit" className="btn-submit main-action" disabled={reportState === 'analyzing' || !reportText.trim()}>
              {reportState === 'analyzing' ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>AI is Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Submit Emergency Report</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {areas.length > 0 && (
            <div className="citizen-history-section animate-fade-in">
              <h4 className="history-title"><History size={16}/> Recent Community Reports</h4>
              <div className="mini-report-list">
                {areas.slice(0, 3).map(report => (
                  <div key={report.id} className="mini-report-item" onClick={() => onSetRegionId(report.id)}>
                    <div className={`severity-dot ${report.status}`}></div>
                    <div className="mini-content">
                      <span className="mini-name">{report.name}</span>
                      <span className="mini-status">{report.tracking_step?.replace('_', ' ')}</span>
                    </div>
                    <ArrowRight size={14} className="arrow" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="panel-section status-tracking animate-fade-in">
          <div className="tracking-header-nav">
             <button className="btn-back-pill" onClick={() => onSetRegionId(null)}><X size={14}/> Close Tracker</button>
             <span className="report-id-badge">ID: {region.id.slice(0,8).toUpperCase()}</span>
          </div>

          <div className="status-hero">
            <div className={`status-icon-box ${region.status}`}>
               {region.tracking_step === 'resolved' ? <CheckCircle size={32}/> : <Activity size={32}/>}
            </div>
            <div className="status-info">
               <h3>{region.tracking_step === 'resolved' ? 'Crisis Resolved' : 'Response in Progress'}</h3>
               <span className={`status-badge-large ${region.tracking_step === 'rejected' ? 'rejected' : region.status}`}>
                {region.tracking_step === 'rejected' ? 'DECLINED' : region.status.toUpperCase()}
               </span>
            </div>
          </div>

          {region.tracking_step === 'rejected' && (
            <div className="rejection-box-large animate-fade-in">
              <ShieldAlert size={24} color="#ef4444" />
              <div className="rejection-content">
                <strong>Administrative Decision</strong>
                <p>{region.rejection_reason || "This report was closed after investigation."}</p>
              </div>
            </div>
          )}
          
          <div className="tracking-timeline-modern">
            {[
              { id: 'ai_analyzing', label: 'AI Validation', icon: <Bot size={16}/> },
              { id: 'authority_review', label: 'Review', icon: <ShieldAlert size={16}/> },
              { id: 'allocation_pending', label: 'Allocating Resources', icon: <Truck size={16}/> },
              { id: 'tanker_dispatched', label: 'En Route', icon: <Truck size={16}/> },
              { id: 'resolved', label: 'Resolved', icon: <CheckCircle size={16}/> }
            ].map((step, idx, arr) => {
              const isPast = arr.findIndex(s => s.id === region.tracking_step) >= idx;
              const isCurrent = region.tracking_step === step.id;
              const isRejected = region.tracking_step === 'rejected' && idx > 0;

              if (region.tracking_step === 'rejected' && idx > 1) return null;

              return (
                <div key={step.id} className={`step-item ${isPast ? 'active' : ''} ${isCurrent ? 'current' : ''} ${isRejected ? 'failed' : ''}`}>
                  <div className="step-line"></div>
                  <div className="step-marker">{isPast ? <CheckCircle size={12}/> : step.icon}</div>
                  <div className="step-label">
                    <span>{region.tracking_step === 'rejected' && idx === 1 ? 'Declined' : step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {region.tanker_eta && region.tracking_step !== 'resolved' && (
            <div className="eta-card-premium animate-pulse-subtle">
              <div className="eta-icon"><Truck size={24}/></div>
              <div className="eta-details">
                <span className="eta-label">Expected Arrival</span>
                <span className="eta-time">{region.tanker_eta}</span>
                <p className="eta-subtext">{region.allocation_details?.name || 'Emergency Tanker'} dispatched</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAdminView = () => (
    <div className="admin-view-panel">
      {!region ? (
        <div className="admin-empty-state">
           <div className="empty-icon-ring">
              <ShieldAlert size={40} className="pulse-opacity" />
           </div>
           <h3>Command Center</h3>
           <p>Select a report from the active queue to initiate response protocols.</p>
        </div>
      ) : (
        <div className="admin-console animate-fade-in">
          <div className="admin-console-header-v2">
            <div className="title-row">
               <h4>{region.name}</h4>
               <span className={`prio-badge ${region.priority?.toLowerCase()}`}>{region.priority}</span>
            </div>
            <p className="timestamp">Received: {region.createdAt?.toDate ? region.createdAt.toDate().toLocaleString() : 'Just now'}</p>
          </div>

          <div className="admin-ai-report-v2">
            <div className="ai-header">
               <Bot size={16} color="#3b82f6" /> <span>AI DIAGNOSTIC REPORT</span>
            </div>
            <div className="ai-stats-grid">
               <div className="ai-stat-item">
                  <span className="stat-label">Confidence</span>
                  <span className="stat-value">{region.confidence}%</span>
               </div>
               <div className="ai-stat-item">
                  <span className="stat-label">Authenticity</span>
                  <span className={`stat-value ${region.is_real ? 'text-safe' : 'text-danger'}`}>
                    {region.is_real ? 'VERIFIED' : 'SUSPICIOUS'}
                  </span>
               </div>
            </div>
            <div className="ai-reason-box">
               <p>"{region.reason}"</p>
            </div>
          </div>

          {region.has_image && (
            <div className="evidence-section-v2">
              <span className="sub-header-label">Visual Evidence</span>
              <div className="evidence-image-wrapper">
                 <img src={region.image_data} alt="Evidence" />
              </div>
            </div>
          )}

          <div className="admin-workflow-v2">
             <span className="sub-header-label">Operational Control</span>
             
             {!rejectionMode ? (
               <div className="action-grid">
                  <button 
                    className="btn-op approve" 
                    onClick={() => handleAdminAction(approveReport, region.id)}
                    disabled={region.tracking_step !== 'authority_review' || processingId === region.id}
                  >
                    {processingId === region.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18}/>}
                    <span>Verify & Authorize</span>
                  </button>
                  
                  <button 
                    className="btn-op reject" 
                    onClick={() => setRejectionMode(true)}
                    disabled={region.status === 'safe' || processingId === region.id}
                  >
                    <X size={18}/>
                    <span>Reject Report</span>
                  </button>

                  <button 
                    className="btn-op resolve" 
                    onClick={() => handleAdminAction(resolveIssue, region.id)}
                    disabled={region.tracking_step !== 'tanker_dispatched' || processingId === region.id}
                  >
                    {processingId === region.id ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18}/>}
                    <span>Complete Resolution</span>
                  </button>
               </div>
             ) : (
               <div className="rejection-form-v2 animate-fade-in">
                  <textarea 
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    autoFocus
                  />
                  <div className="rejection-actions">
                     <button className="btn-cancel" onClick={() => setRejectionMode(false)}>Cancel</button>
                     <button 
                       className="btn-confirm-reject" 
                       disabled={!rejectionReason.trim()}
                       onClick={() => handleAdminAction(rejectReport, region.id, rejectionReason)}
                     >
                       Confirm Rejection
                     </button>
                  </div>
               </div>
             )}
          </div>

          {(region.tracking_step === 'allocation_pending' || region.tracking_step === 'tanker_dispatched') && (
            <div className="fleet-dispatch-v2">
              <span className="sub-header-label">Resource Allocation</span>
              <div className="tanker-grid">
                {tankers.map(t => (
                  <button 
                    key={t.id} 
                    className={`tanker-card-btn ${t.status !== 'available' ? 'busy' : ''} ${region.allocation_details?.id === t.id ? 'allocated' : ''}`}
                    disabled={t.status !== 'available' || region.tracking_step === 'tanker_dispatched' || processingId === region.id}
                    onClick={() => handleAdminAction(dispatchTanker, region.id, t.id)}
                  >
                    <Truck size={18} />
                    <div className="tanker-info">
                       <span className="name">{t.name}</span>
                       <span className="status">{t.status}</span>
                    </div>
                    {processingId === region.id && <Loader2 size={14} className="animate-spin ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="context-panel-wrapper">
      {forceMode === 'citizen' ? renderCitizenView() : renderAdminView()}
    </div>
  );
}

// Additional Lucide icons needed
function ShieldCheck({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

