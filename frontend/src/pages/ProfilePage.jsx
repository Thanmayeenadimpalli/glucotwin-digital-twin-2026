import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPatientProfile } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { User, Activity, Heart, Shield, FileText, CheckCircle2, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { patientId } = useParams();
  const activeId = patientId || 'GT-001';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getPatientProfile(activeId);
        setProfile(res.data);
      } catch (err) {
        setError(`Failed to load profile for ${activeId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [activeId]);

  if (loading) return <LoadingState message="Loading EHR profile..." />;
  if (error) return <ErrorState error={error} />;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
          <User className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-teal-400 font-bold">{profile.patient_id}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-semibold">{profile.activity_level_baseline} Activity Baseline</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-0.5">{profile.name}</h1>
          <p className="text-xs text-slate-400">Demographics & Static Electronic Health Record (Synthetic EHR Data)</p>
        </div>
      </div>

      {/* Grid: Demographics, Medical History, Lab Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Demographics Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <User className="w-4 h-4" />
            <span>Demographics</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Age</span>
              <span className="font-semibold text-white">{profile.age} years</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Sex</span>
              <span className="font-semibold text-white">{profile.sex === 'M' ? 'Male' : 'Female'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Body Mass Index (BMI)</span>
              <span className="font-semibold text-white">{profile.bmi} kg/m²</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Smoking History</span>
              <span className="font-semibold text-white">{profile.smoking_status}</span>
            </div>
          </div>
        </div>

        {/* Metabolic Lab Values */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Activity className="w-4 h-4" />
            <span>Baseline Metabolic Labs</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">HbA1c</span>
              <span className="font-semibold text-teal-300">{profile.hba1c}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Fasting Plasma Glucose</span>
              <span className="font-semibold text-white">{profile.fasting_glucose} mg/dL</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Baseline Activity Index</span>
              <span className="font-semibold text-white">{profile.activity_level_baseline}</span>
            </div>
          </div>
        </div>

        {/* Clinical History & Risk Factors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>Clinical Risk Factors</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Hypertension Diagnosis</span>
              {profile.hypertension === 1 ? (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> Present
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> None
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Family History of Diabetes</span>
              {profile.family_history_diabetes === 1 ? (
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <XCircle className="w-3.5 h-3.5" /> Positive
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Negative
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
