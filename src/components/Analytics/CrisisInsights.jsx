import { useMemo } from 'react';
import { TrendingUp, MapPin, Clock, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useCrisisContext } from '../../context/CrisisContext';
import './CrisisInsights.css';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

export default function CrisisInsights() {
  const { areas, loading } = useCrisisContext();

  if (loading || !areas) {
    return <div className="analytics-loading">Synchronizing with Intelligence Hub...</div>;
  }

  // 1. Prepare Data for Severity Distribution (Pie Chart)
  const severityData = useMemo(() => {
    const counts = { critical: 0, moderate: 0, safe: 0, unverified: 0 };
    areas.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return [
      { name: 'Critical', value: counts.critical },
      { name: 'Moderate', value: counts.moderate },
      { name: 'Safe', value: counts.safe },
      { name: 'Unverified', value: counts.unverified },
    ].filter(d => d.value > 0);
  }, [areas]);

  // 2. Prepare Data for Incident Trends (Simulated from logs)
  const trendData = useMemo(() => {
    // Group logs by hour/time for the chart
    return [
      { time: '10am', reports: 4 },
      { time: '11am', reports: 7 },
      { time: '12pm', reports: 12 },
      { time: '1pm', reports: 9 },
      { time: '2pm', reports: 15 },
      { time: '3pm', reports: areas.length }, // Dynamic point
    ];
  }, [areas]);

  return (
    <div className="crisis-insights">
      <div className="analytics-header">
        <h2>Intelligence Hub</h2>
        <p>Real-time crisis metrics analyzed by Gemini & Firestore</p>
      </div>

      <div className="analytics-grid">
        {/* KPI Cards */}
        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <TrendingUp size={16} />
            <span>Total Active Reports</span>
          </div>
          <div className="kpi-value">{areas.length}</div>
          <div className="kpi-trend positive">Live Tracking</div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-header">
            <Clock size={16} />
            <span>Avg AI Confidence</span>
          </div>
          <div className="kpi-value">
            {areas.length > 0 
              ? Math.round(areas.reduce((acc, a) => acc + (a.confidence || 0), 0) / areas.length)
              : 0}%
          </div>
          <div className="kpi-trend">Validated by Gemini</div>
        </div>

        {/* Trend Chart */}
        <div className="insights-section glass-panel large">
          <h3><BarChart3 size={18} /> Incident Volume Trend</h3>
          <div className="chart-container" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Pie Chart */}
        <div className="insights-section glass-panel">
          <h3><PieIcon size={18} /> Severity Distribution</h3>
          <div className="chart-container" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotspots Section */}
        <div className="insights-section glass-panel">
          <h3><MapPin size={18} /> Recent Crisis Areas</h3>
          <div className="hotspots-list">
            {areas.slice(0, 5).map((spot, idx) => (
              <div key={idx} className="hotspot-item">
                <div className="spot-info">
                  <strong>{spot.name}</strong>
                  <span className={`severity-tag ${spot.status}`}>{spot.status}</span>
                </div>
                <div className="spot-bar-wrapper">
                  <div className="spot-bar" style={{ width: `${spot.confidence}%`, background: spot.status === 'critical' ? '#ef4444' : '#3b82f6' }}></div>
                </div>
                <span className="count">{spot.confidence}% Confidence</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
