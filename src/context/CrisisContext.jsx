import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { AIValidationService } from '../services/CrisisService';

const CrisisContext = createContext();

export function useCrisisContext() {
  const context = useContext(CrisisContext);
  if (!context) throw new Error("useCrisisContext must be used within a CrisisProvider");
  return context;
}

export function CrisisProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tankers, setTankers] = useState([]);

  useEffect(() => {
    // Ensure anonymous auth for Firestore writes
    import('firebase/auth').then(({ signInAnonymously, getAuth }) => {
      const auth = getAuth();
      signInAnonymously(auth).catch(err => console.error("Auth failed:", err));
    });

    const timer = setTimeout(() => setLoading(false), 3000);

    const qReports = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubReports = onSnapshot(qReports, (snapshot) => {
      setAreas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, () => setLoading(false));

    const unsubTankers = onSnapshot(collection(db, "tankers"), (snapshot) => {
      setTankers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qLogs = query(collection(db, "logs"), orderBy("time", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      clearTimeout(timer);
      unsubReports();
      unsubTankers();
      unsubLogs();
    };
  }, []);

  const addLog = async (type, message) => {
    await addDoc(collection(db, "logs"), {
      type,
      message,
      time: serverTimestamp()
    });
  };

  const reportIssue = async (areaName, description, base64Image = null) => {
    try {
      addLog('report', `🚨 New report: ${areaName}`);
      const docRef = await addDoc(collection(db, "reports"), {
        name: areaName,
        description,
        status: 'unverified',
        priority: 'PENDING',
        confidence: 0,
        tracking_step: 'ai_analyzing',
        createdAt: serverTimestamp(),
        has_image: !!base64Image,
        image_data: base64Image
      });

      // AI Analysis
      const rawAnalysis = await AIValidationService.analyzeReport(description, base64Image);
      
      // Normalize analysis with defaults to prevent empty fields in UI
      const analysis = {
        is_real: rawAnalysis?.is_real ?? true,
        confidence: rawAnalysis?.confidence ?? 50,
        priority: rawAnalysis?.priority ?? 'MEDIUM',
        reason: rawAnalysis?.reason || "Analysis completed by Crisis AI system.",
        water_level: rawAnalysis?.water_level ?? 50,
        needs_tanker: rawAnalysis?.needs_tanker ?? false
      };

      const isCriticalHighConf = analysis.priority === 'CRITICAL' && analysis.confidence > 90;

      await updateDoc(doc(db, "reports", docRef.id), {
        ...analysis,
        tracking_step: isCriticalHighConf ? 'allocation_pending' : (analysis.is_real ? 'authority_review' : 'stable'),
        status: analysis.priority === 'CRITICAL' ? 'critical' : (analysis.priority === 'HIGH' ? 'moderate' : 'safe'),
        trust_level: isCriticalHighConf ? 'verified' : (analysis.is_real ? 'under-review' : 'suspicious')
      });

      if (isCriticalHighConf) addLog('dispatch', `⚡ AUTO-DISPATCH: Critical emergency at ${areaName}`);
      
      return docRef.id;
    } catch (e) {
      console.error(e);
      addLog('error', 'AI Processing Failed');
    }
  };

  const approveReport = async (id, priority = 'HIGH') => {
    const status = priority === 'CRITICAL' ? 'critical' : (priority === 'HIGH' ? 'moderate' : 'safe');
    await updateDoc(doc(db, "reports", id), { 
      tracking_step: 'allocation_pending', 
      trust_level: 'verified',
      priority,
      status
    });
    addLog('admin', `✅ Report Approved [${priority}]: ${id}`);
  };

  const provisionTankers = async () => {
    const demoTankers = [
      { name: "Alpha-1 (Heavy)", status: "available", capacity: "10k L" },
      { name: "Beta-4 (Rapid)", status: "available", capacity: "5k L" },
      { name: "Gamma-9 (Hospital)", status: "available", capacity: "12k L" }
    ];
    for (const t of demoTankers) {
      await addDoc(collection(db, "tankers"), t);
    }
    addLog('system', "🚚 Demo fleet provisioned successfully.");
  };

  const rejectReport = async (id, reason) => {
    await updateDoc(doc(db, "reports", id), { status: 'safe', tracking_step: 'rejected', rejection_reason: reason });
    addLog('admin', `❌ Report Rejected: ${reason}`);
  };

  const dispatchTanker = async (reportId, tankerId) => {
    const tanker = tankers.find(t => t.id === tankerId);
    await updateDoc(doc(db, "reports", reportId), {
      tracking_step: 'tanker_dispatched',
      tanker_eta: '15 mins',
      allocation_details: { id: tankerId, name: tanker.name }
    });
    await updateDoc(doc(db, "tankers", tankerId), { status: 'en-route' });
    addLog('dispatch', `🚚 ${tanker.name} dispatched.`);
  };

  const resolveIssue = async (id) => {
    const report = areas.find(r => r.id === id);
    if (report?.allocation_details) {
      await updateDoc(doc(db, "tankers", report.allocation_details.id), { status: 'available' });
    }
    await updateDoc(doc(db, "reports", id), { status: 'safe', tracking_step: 'resolved' });
    addLog('resolve', `✅ Crisis Resolved: ${id}`);
  };

  return (
    <CrisisContext.Provider value={{ 
      loading, areas, logs, tankers, 
      reportIssue, dispatchTanker, approveReport, resolveIssue, rejectReport, provisionTankers 
    }}>
      {children}
    </CrisisContext.Provider>
  );
}
