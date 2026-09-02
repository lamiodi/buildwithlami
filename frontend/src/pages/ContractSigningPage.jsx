import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import {
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Download,
  Calendar,
  DollarSign,
  Briefcase,
  User,
  Eraser,
  Hash,
} from 'lucide-react';
import Skeleton from '../components/Skeleton';

export default function ContractSigningPage() {
  const { token } = useParams();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signedData, setSignedData] = useState(null);

  // Canvas drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/contracts/sign/${token}`);
        if (res.ok && res.data) {
          setContract(res.data);
          setSignerName(res.data.signatoryName || '');
          setSignerEmail(res.data.signatoryEmail || '');
          if (res.data.status === 'SIGNED') {
            setIsSigned(true);
            setSignedData({
              signedAt: res.data.signedAt,
              contractHash: res.data.contractHash,
              signatureData: res.data.signatureData,
            });
          }
        } else {
          setError(res.error || (res.data && res.data.error) || 'Invalid or expired signing link.');
        }
      } catch {
        setError('Failed to connect to signing server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchContract();
  }, [token]);

  // Canvas setup & resizing
  useEffect(() => {
    if (!canvasRef.current || isSigned) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
  }, [canvasRef, isSigned, loading]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    if (e.type === 'touchstart') e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmitSignature = async (e) => {
    e.preventDefault();
    if (!hasSignature) {
      alert('Please draw your signature in the designated box before submitting.');
      return;
    }
    if (!agreedToTerms) {
      alert('Please check the box confirming your agreement to the terms.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');

    setSubmitting(true);
    try {
      const res = await api.post(`/contracts/sign/${token}`, {
        signerName,
        signerEmail,
        signatureData,
        agreedToTerms: true,
      });

      if (res.ok && res.data) {
        setIsSigned(true);
        setSignedData({
          signedAt: res.data.contract?.signedAt || new Date().toISOString(),
          contractHash: res.data.contract?.contractHash,
          signatureData,
        });
      } else {
        alert(res.error || (res.data && res.data.error) || 'Failed to submit signature.');
      }
    } catch {
      alert('An error occurred while submitting your signature. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center p-6 font-body">
        <div className="w-full max-w-md bg-white dark:bg-[#141414] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Unable to Load Agreement</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link to="/" className="btn-secondary w-full inline-flex items-center justify-center">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedAmount = contract.amount > 0
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: contract.currency || 'NGN' }).format(Number(contract.amount))
    : 'Milestone Agreed';

  const formattedDeposit = contract.depositAmount > 0
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: contract.currency || 'NGN' }).format(Number(contract.depositAmount))
    : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background text-gray-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-accent/20">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <div className="font-heading font-black text-lg tracking-tight">
                BuildWith<span className="text-accent">_Lami</span> Studio
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Certified Electronic Agreement</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {isSigned ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Executed & Signed
              </span>
            ) : contract.isExpired ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Expired
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Pending Signature
              </span>
            )}
          </div>
        </div>

        {/* Contract Details Header */}
        <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent font-bold mb-1">
              {contract.contractType} AGREEMENT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-gray-900 dark:text-white">
              {contract.title}
            </h1>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs">
            <div>
              <div className="text-gray-400 dark:text-gray-500 uppercase font-mono font-bold mb-1">Client</div>
              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{contract.clientName || 'Client'}</span>
              </div>
            </div>
            <div>
              <div className="text-gray-400 dark:text-gray-500 uppercase font-mono font-bold mb-1">Project</div>
              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{contract.projectName || 'General Engagement'}</span>
              </div>
            </div>
            <div>
              <div className="text-gray-400 dark:text-gray-500 uppercase font-mono font-bold mb-1">Total Fee</div>
              <div className="font-bold text-accent">{formattedAmount}</div>
            </div>
            <div>
              <div className="text-gray-400 dark:text-gray-500 uppercase font-mono font-bold mb-1">Deposit</div>
              <div className="font-bold text-gray-900 dark:text-white">{formattedDeposit || 'Per Schedule'}</div>
            </div>
          </div>

          {/* Terms Content Box */}
          <div className="space-y-3">
            <div className="text-xs uppercase font-mono font-bold text-gray-400 dark:text-gray-500 tracking-wider">
              Terms & Conditions
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-mono">
              {contract.termsContent}
            </div>
          </div>
        </div>

        {/* Signing Area or Completion View */}
        {isSigned ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#141414] rounded-3xl p-6 sm:p-10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agreement Successfully Executed</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Signed on {new Date(signedData?.signedAt || contract.signedAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 space-y-4">
              <div className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                This document is certified with an immutable cryptographic audit record.
              </div>

              {signedData?.signatureData && (
                <div>
                  <div className="text-[11px] font-mono uppercase text-gray-400 dark:text-gray-500 mb-1">
                    Recorded Signature:
                  </div>
                  <div className="p-3 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 inline-block">
                    <img
                      src={signedData.signatureData}
                      alt="Signer Signature"
                      className="h-14 w-auto object-contain dark:invert"
                    />
                  </div>
                </div>
              )}

              {signedData?.contractHash && (
                <div className="pt-2 border-t border-emerald-200/40 dark:border-emerald-800/30">
                  <div className="text-[10px] uppercase font-mono text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-1">
                    <Hash className="w-3 h-3" />
                    <span>Document Cryptographic Hash (SHA-256):</span>
                  </div>
                  <div className="font-mono text-[11px] text-gray-700 dark:text-gray-300 break-all select-all bg-white/60 dark:bg-black/60 p-2 rounded-lg border border-gray-200 dark:border-white/10">
                    {signedData.contractHash}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`/api/contracts/${contract.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download / Print Document
              </a>
              <Link
                to="/portal/login"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Go to Client Portal
              </Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmitSignature} className="bg-white dark:bg-[#141414] rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-white/10 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Execute Digital Signature</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Please type your legal full name and draw your signature below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Signatory Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Signatory Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Signature Drawing Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400">
                  Draw Signature *
                </label>
                {hasSignature && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs font-bold text-gray-400 hover:text-accent flex items-center gap-1 transition-colors"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className="relative border-2 border-dashed border-gray-200 dark:border-white/20 rounded-2xl bg-gray-50 dark:bg-white/5 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ touchAction: 'none' }}
                  className="w-full h-44 cursor-crosshair block"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 font-mono">
                    Use mouse or finger to sign here
                  </div>
                )}
              </div>
            </div>

            {/* Legal Consent Checkbox */}
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 cursor-pointer text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded text-accent focus:ring-accent w-4 h-4"
              />
              <span>
                I, <strong>{signerName || 'the Signatory'}</strong>, confirm that I am authorized to enter into this Agreement. I have read and agree to all terms and conditions above, and acknowledge that this electronic signature carries full legal force.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !hasSignature || !agreedToTerms}
              className="btn-primary w-full py-4 text-sm font-bold uppercase tracking-wider inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Authenticating & executing agreement...' : 'Sign & Complete Agreement →'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
