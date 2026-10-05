import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientReport } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { FileText, Printer, ShieldAlert, Zap, User } from 'lucide-react';

export default function ReportsPage() {
  const { patientId } = useParams();
  const activeId = patientId || 'GT-001';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await getPatientReport(activeId);
        setReport(res.data);
      } catch (err) {
        setError(`Failed to generate report for ${activeId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [activeId]);

  if (loading) return <LoadingState message="Generating Clinical Summary Report..." />;
  if (error) return <ErrorState error={error} />;
  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Digital Twin Patient Summary Report</h1>
            <p className="text-xs text-slate-400">Report ID: {report.report_id} • Generated {new Date(report.generated_at).toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print Report
        </button>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 bg-amber-950/50 border border-amber-800/50 rounded-2xl text-amber-200 text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <ShieldAlert className="w-4 h-4" /> MEDICAL & RESEARCH DISCLAIMER
        </div>
        <p>{report.disclaimer}</p>
      </div>

      {/* Structured Sections */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Patient Profile */}
        <div>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User className="w-4 h-4" /> Patient Demographics & Baseline Labs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div><span className="text-slate-400 block">Age:</span><span className="font-bold text-white">{report.patient_profile?.age}</span></div>
            <div><span className="text-slate-400 block">Sex:</span><span className="font-bold text-white">{report.patient_profile?.sex}</span></div>
            <div><span className="text-slate-400 block">BMI:</span><span className="font-bold text-white">{report.patient_profile?.bmi}</span></div>
            <div><span className="text-slate-400 block">HbA1c:</span><span className="font-bold text-teal-300">{report.patient_profile?.hba1c}%</span></div>
          </div>
        </div>

        {/* Current State */}
        <div>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Current Digital Twin State & 2-Hour Prediction
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div><span className="text-slate-400 block">Risk Category:</span><span className="font-bold text-red-400">{report.current_digital_twin_status?.risk_level} Risk</span></div>
            <div><span className="text-slate-400 block">Spike Probability:</span><span className="font-bold text-white">{report.current_digital_twin_status?.risk_percentage}%</span></div>
            <div><span className="text-slate-400 block">Current Glucose:</span><span className="font-bold text-white">{report.current_digital_twin_status?.current_glucose} mg/dL</span></div>
          </div>
        </div>

        {/* ML Model Performance */}
        <div>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3">
            ML Model Architecture & Verification Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div><span className="text-slate-400 block">Classifier:</span><span className="font-bold text-white">{report.ml_model_context?.model_type}</span></div>
            <div><span className="text-slate-400 block">ROC-AUC:</span><span className="font-bold text-teal-300">{report.ml_model_context?.roc_auc}</span></div>
            <div><span className="text-slate-400 block">PR-AUC:</span><span className="font-bold text-teal-300">{report.ml_model_context?.pr_auc}</span></div>
            <div><span className="text-slate-400 block">F1-Score:</span><span className="font-bold text-teal-300">{report.ml_model_context?.f1_score}</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
