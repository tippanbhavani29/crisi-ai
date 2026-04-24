import { useState, useRef } from 'react';
import { 
  AlertCircle, CheckCircle, Truck, Bot, Activity, 
  Camera, X, Image as ImageIcon, MapPin, LayoutDashboard, ShieldAlert
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
    const newId = await reportIssue("Spotted Location", reportText, selectedImage);
    if (onReportCreated) onReportCreated(newId);
    setReportState('complete');
  };

  const renderCitizenView = () => (
    <div className="citizen-view">
      {!region ? (
        <div className="panel-section">
          <h3 className="section-title"><AlertCircle size={16}/> Report Water Crisis</h3>
          <form className="report-form" onSubmit={handleReportSubmit}>
            <textarea
              className="report-input"
              placeholder="Describe the issue (e.g., Hospital is dry, Sector 4 has no water)"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              disabled={reportState === 'analyzing'}
              rows={4}
            />
            <div className="report-actions-row">
              <button type="button" className="action-icon-btn" onClick={detectLocation}>
                <MapPin size={18} className={locationLoading ? 'animate-pulse' : ''} /> 
                <span>{locationLoading ? 'Locating...' : 'Auto-Location'}</span>
              </button>
              <button type="button" className="action-icon-btn" onClick={() => fileInputRef.current.click()}>
                <Camera size={18} /> <span>Add Photo</span>
              </button>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                const r = new FileReader();
                r.onloadend = () => setSelectedImage(r.result);
                r.readAsDataURL(file);
              }} ref={fileInputRef} style={{ display: 'none' }} />
            </div>
            {selectedImage && <div className="image-preview-mini"><img src={selectedImage} alt="Preview" /></div>}
            <button type="submit" className="btn-submit main-action" disabled={reportState === 'analyzing' || !reportText.trim()}>
              {reportState === 'analyzing' ? 'AI Analyzing...' : 'Submit Emergency Report'}
            </button>
          </form>
        </div>
      ) : (
        <div className="panel-section status-tracking animate-fade-in">
          <button className="btn-back" onClick={() => onSetRegionId(null)}><X size={14}/> New Report</button>
          <div className="status-header">
            <h3>Crisis Tracking</h3>
            <span className={`status-badge ${region.tracking_step === 'rejected' ? 'rejected' : region.status}`}>
              {region.tracking_step === 'rejected' ? 'DECLINED' : region.status.toUpperCase()}
            </span>
          </div>

          {region.tracking_step === 'rejected' && (
            <div className="rejection-box glass-panel animate-fade-in">
              <ShieldAlert size={20} color="#ef4444" />
              <div>
                <strong>Report Declined</strong>
                <p>{region.rejection_reason || "This report was closed by an administrator."}</p>
              </div>
            </div>
          )}
          
          <div className="tracking-timeline">
            <div className={`time-step ${['ai_analyzing', 'authority_review', 'allocation_pending', 'tanker_dispatched', 'resolved', 'rejected'].includes(region.tracking_step) ? 'active' : ''}`}>
               <div className="dot"></div> <span>AI Validated</span>
            </div>
            <div className={`time-step ${['authority_review', 'allocation_pending', 'tanker_dispatched', 'resolved'].includes(region.tracking_step) ? 'active' : ''} ${region.tracking_step === 'rejected' ? 'failed' : ''}`}>
               <div className="dot"></div> <span>{region.tracking_step === 'rejected' ? 'Declined by Admin' : 'Authority Review'}</span>
            </div>
            {region.tracking_step !== 'rejected' && (
              <>
                <div className={`time-step ${['tanker_dispatched', 'resolved'].includes(region.tracking_step) ? 'active' : ''}`}>
                   <div className="dot"></div> <span>Tanker Dispatched</span>
                </div>
                <div className={`time-step ${region.tracking_step === 'resolved' ? 'active' : ''}`}>
                   <div className="dot"></div> <span>Resolved</span>
                </div>
              </>
            )}
          </div>

          {region.tanker_eta && (
            <div className="eta-card glass-panel">
              <Truck size={20} color="#3b82f6" />
              <div>
                <strong>{region.allocation_details?.name || 'Tanker'} is En Route</strong>
                <p>ETA: {region.tanker_eta}</p>
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
           <ShieldAlert size={48} opacity={0.2} />
           <p>Select a report from the queue to start response</p>
        </div>
      ) : (
        <div className="admin-console animate-fade-in">
          <div className="admin-console-header">
            <h4>{region.name}</h4>
            <span className={`prio-tag ${region.priority?.toLowerCase()}`}>{region.priority}</span>
          </div>

          <div className="admin-ai-report glass-panel">
            <div className="ai-score-row">
               <div className="ai-metric">
                  <span className="label">AI Confidence</span>
                  <span className="value highlight">{region.confidence}%</span>
               </div>
               <div className="ai-metric">
                  <span className="label">Authenticity</span>
                  <span className={`value ${region.is_real ? 'text-safe' : 'text-danger'}`}>
                    {region.is_real ? 'REAL' : 'FAKE/SPAM'}
                  </span>
               </div>
            </div>
            <p className="ai-analysis-text">"{region.reason}"</p>
          </div>

          {region.has_image && (
            <div className="evidence-section">
              <span className="sub-label">Image Evidence</span>
              <img src={region.image_data} alt="Evidence" className="admin-img-large" />
            </div>
          )}

          <div className="admin-workflow-actions">
             <span className="sub-label">Workflow Management</span>
             <div className="action-buttons">
                <button 
                  className="btn-workflow approve" 
                  onClick={() => approveReport(region.id)}
                  disabled={region.tracking_step !== 'authority_review'}
                >
                  Accept & Verify
                </button>
                <button 
                  className="btn-workflow reject" 
                  onClick={() => {
                    const r = prompt("Reason for rejection?");
                    if(r) rejectReport(region.id, r);
                  }}
                  disabled={region.status === 'safe'}
                >
                  Reject Spam
                </button>
                <button 
                  className="btn-workflow resolve" 
                  onClick={() => resolveIssue(region.id)}
                  disabled={region.tracking_step !== 'tanker_dispatched'}
                >
                  Complete Resolution
                </button>
             </div>
          </div>

          {(region.tracking_step === 'allocation_pending' || region.tracking_step === 'tanker_dispatched') && (
            <div className="fleet-allocation">
              <span className="sub-label">Fleet Dispatch</span>
              <div className="tanker-list-admin">
                {tankers.map(t => (
                  <button 
                    key={t.id} 
                    className={`tanker-btn ${t.status !== 'available' ? 'busy' : ''}`}
                    disabled={t.status !== 'available' || region.tracking_step === 'tanker_dispatched'}
                    onClick={() => dispatchTanker(region.id, t.id)}
                  >
                    <Truck size={14} />
                    <span>{t.name} ({t.status})</span>
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
