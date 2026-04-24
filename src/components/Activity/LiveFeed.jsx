import { Activity, Bot, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCrisisContext } from '../../context/CrisisContext';
import './LiveFeed.css';

const getIconForType = (type) => {
  switch(type) {
    case 'report': return <AlertTriangle size={14} color="#ef4444" />;
    case 'ai': return <Bot size={14} color="#3b82f6" />;
    case 'dispatch': return <Truck size={14} color="#f59e0b" />;
    case 'resolve': return <CheckCircle size={14} color="#10b981" />;
    default: return <Activity size={14} color="#94a3b8" />;
  }
};

export default function LiveFeed({ forceMode }) {
  const { logs } = useCrisisContext();

  return (
    <div className="live-feed-wrapper glass-panel">
      <div className="feed-header">
        <Activity size={18} />
        <span>Live Activity Feed</span>
      </div>

      <div className="feed-content">
        <ul className="feed-list">
          {logs.map(log => (
            <li key={log.id} className="feed-item">
              <div className="feed-icon-wrap">
                {getIconForType(log.type)}
              </div>
              <div className="feed-body">
                <div className="feed-msg">{log.message}</div>
                <div className="feed-time">
                  {log.time?.seconds 
                    ? new Date(log.time.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Just now'}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
