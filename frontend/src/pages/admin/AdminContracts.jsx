import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import {
  FileSignature,
  Plus,
  Download,
  Search,
  X,
  CheckCircle,
  Clock,
  User,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  FileText,
  Briefcase,
  Hash,
} from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { notify } from '../../services/notify';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATES = {
  SOFTWARE: {
    label: 'Software Engineering & Web Architecture MSA',
    title: 'Master Software Development & Engineering Agreement',
    terms: `1. ENGAGEMENT & SCOPE
BuildWith_Lami ("Developer / Studio") agrees to provide custom software engineering, frontend and backend architecture, database modeling, and deployment services as outlined in the agreed Project Specifications.

2. TIMELINE & MILESTONES
Execution shall commence upon receipt of the initial commitment deposit. Milestones, sprints, and delivery schedules shall proceed according to the agreed project duration.

3. PAYMENT TERMS & DEPOSIT
The Client agrees to pay the total contract fee according to the specified breakdown. The initial deposit is non-refundable once engineering architecture commences. Final project handoff and production deployment credentials shall be released upon complete settlement of the outstanding balance.

4. INTELLECTUAL PROPERTY & CODE OWNERSHIP
Upon full and final payment of all fees due hereunder, the Client shall own all proprietary software, bespoke source code, and design assets developed specifically for this project. Developer retains ownership of pre-existing frameworks, libraries, and modular utilities utilized in the build.

5. CONFIDENTIALITY & NON-DISCLOSURE
Developer and Client agree to protect and preserve the confidentiality of all proprietary business data, secrets, customer lists, and codebases disclosed during the course of the engagement.

6. ACCEPTANCE & REVISION WINDOW
Client shall have fourteen (14) calendar days from milestone delivery to review and test the deliverables. In the absence of written notices of defect within this window, deliverables shall be deemed accepted.

7. LIMITATION OF LIABILITY & GOVERNING LAW
Neither party shall be liable for indirect or consequential damages. This Agreement shall be construed and governed in accordance with the laws of the Federal Republic of Nigeria.`,
  },
  DRONE: {
    label: 'Aerial Drone Surveying & Photogrammetry Agreement',
    title: 'Aerial Drone Surveying, Photogrammetry & Mapping Agreement',
    terms: `1. FLIGHT MISSION SCOPE
BuildWith_Lami Drone Division agrees to conduct high-precision aerial drone photogrammetry, orthomosaic mapping, volumetric calculations, and 3D topographic modeling of the designated site.

2. AIRSPACE, REGULATORY & WEATHER CLEARANCES
Flight operations are contingent upon meteorological safety and airspace compliance with civil aviation guidelines. In the event of adverse weather (precipitation, high wind speed), flight dates will be rescheduled without additional penalty.

3. ACCURACY & DELIVERABLES
Deliverables include high-resolution GeoTIFF orthomosaic maps, digital surface models (DSM), point cloud datasets, and volumetric inspection reports referenced to ground control points (GCPs) where applicable.

4. SITE ACCESS & SAFETY PROTOCOLS
The Client warrants lawful authority to permit aerial data capture over the target property and agrees to secure ground clearance for the flight operations team.

5. PAYMENT TERMS
A fifty percent (50%) deposit is required prior to mobilization of flight crews and aerial equipment. Final orthomosaic files and analytical datasets will be transferred upon full payment.

6. GOVERNING LAW
This agreement is governed by the laws of the Federal Republic of Nigeria.`,
  },
  SURVEY: {
    label: 'Geodetic Land Surveying & Boundary Demarcation',
    title: 'Geodetic Land Surveying & Boundary Demarcation Agreement',
    terms: `1. PROFESSIONAL SURVEYING SERVICES
BuildWith_Lami Survey Division agrees to execute cadastral land surveying, beacon boundary demarcation, topographic mapping, and documentation in strict compliance with the Surveyors Council of Nigeria (SURCON) standards.

2. FIELD OBSERVATIONS & BEACONING
Surveyors will establish permanent boundary beacons on the subject parcel and execute precise dual-frequency GNSS/RTK coordinate observations tied to national geodetic origin.

3. DELIVERABLES & PLAN RECORDING
Deliverables include certified survey plans signed by a Registered Surveyor, boundary beacon descriptions, and perimeter coordinates suitable for title registration and Governor's Consent lodgement.

4. SITE ACCESS & CLIENT REPRESENTATION
Client or an authorized representative shall accompany the field team to indicate boundaries and confirm adjoining land titles during site reconnaissance.

5. PAYMENT SCHEDULE
Mobilization fee is due prior to field beacon planting. Final certified survey plans will be sealed and handed over upon full balance settlement.

6. DISPUTE RESOLUTION
Any questions regarding boundary interpretation shall be resolved according to the Survey Laws of the respective State jurisdiction.`,
  },
  CUSTOM: {
    label: 'Custom Consulting & Technical Services Agreement',
    title: 'Professional Services & Consulting Agreement',
    terms: `1. SCOPE OF SERVICES
BuildWith_Lami agrees to deliver specialized technical, architectural, or advisory services as specified in the agreed project scope.

2. TERM & TERMINATION
This Agreement remains in effect until deliverables are achieved or terminated by either party with fourteen (14) days written notice.

3. FEES & INVOICING
Services will be invoiced according to agreed project milestones. Invoices are payable within seven (7) days of issuance.

4. CONFIDENTIALITY & WORK PRODUCT
All client confidential data remains protected. Work product transfers to Client upon complete payment.

5. GOVERNING LAW
Governed by the laws of the Federal Republic of Nigeria.`,
  },
};

export default function AdminContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedContract, setSelectedContract] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);

  // Form state
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [contractType, setContractType] = useState('SOFTWARE');
  const [title, setTitle] = useState(TEMPLATES.SOFTWARE.title);
  const [termsContent, setTermsContent] = useState(TEMPLATES.SOFTWARE.terms);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [depositAmount, setDepositAmount] = useState('');
  const [duration, setDuration] = useState('4 Weeks');
  const [signatoryEmail, setSignatoryEmail] = useState('');
  const [signatoryName, setSignatoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts');
      if (res.ok && res.data) setContracts(res.data);
    } catch {
      notify.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndProjects = async () => {
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        api.get('/clients'),
        api.get('/client-projects'),
      ]);
      if (clientsRes.ok && clientsRes.data) setClients(clientsRes.data);
      if (projectsRes.ok && projectsRes.data) setProjects(projectsRes.data);
    } catch {
      // dropdown fallback
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchClientsAndProjects();
  }, []);

  const handleTemplateChange = (type) => {
    setContractType(type);
    const tmpl = TEMPLATES[type] || TEMPLATES.CUSTOM;
    setTitle(tmpl.title);
    setTermsContent(tmpl.terms);
  };

  const handleClientSelect = (id) => {
    setClientId(id);
    const selected = clients.find((c) => c.id === id);
    if (selected) {
      if (!signatoryName) setSignatoryName(selected.name || '');
      if (!signatoryEmail) setSignatoryEmail(selected.primary_contact_email || '');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/contracts', {
        clientId,
        projectId: projectId || undefined,
        contractType,
        title,
        termsContent,
        amount: Number(amount) || 0,
        currency,
        depositAmount: Number(depositAmount) || 0,
        duration,
        signatoryEmail,
        signatoryName,
      });

      if (res.ok) {
        notify.success('Contract generated and signing invitation sent via Brevo');
        setShowCreate(false);
        fetchContracts();
        // Reset form
        setClientId('');
        setProjectId('');
        setAmount('');
        setDepositAmount('');
        setSignatoryEmail('');
        setSignatoryName('');
      } else {
        notify.error(res.error || (res.data && res.data.error) || 'Failed to create contract');
      }
    } catch {
      notify.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySigningLink = (token) => {
    const url = `${window.location.origin}/sign/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    notify.success('Signing link copied to clipboard');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        (c.title || '').toLowerCase().includes(searchLower) ||
        (c.client_name || '').toLowerCase().includes(searchLower) ||
        (c.project_name || '').toLowerCase().includes(searchLower) ||
        (c.signatory_email || '').toLowerCase().includes(searchLower) ||
        (c.signer_name || '').toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [contracts, statusFilter, search]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-accent" />
            Legal Contracts & E-Signatures
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create native digital agreements, track client e-signatures, and verify cryptographic audit trails.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 inline-flex items-center gap-2 text-sm uppercase tracking-wider self-start sm:self-auto cursor-pointer"
        >
          <Plus size={18} /> New Contract
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-card p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts, clients, or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-background text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['ALL', 'SENT', 'SIGNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Create Contract Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreate}
            className="bg-white dark:bg-card p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create & Dispatch Service Agreement</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Pre-fills legal clauses and dispatches a certified digital signing link via Brevo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Chooser */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Agreement Type / Template *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTemplateChange(key)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      contractType === key
                        ? 'border-accent bg-accent/5 dark:bg-accent/10 ring-1 ring-accent'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 bg-gray-50 dark:bg-white/5'
                    }`}
                  >
                    <div className="font-bold text-xs text-gray-900 dark:text-white">{key}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                  Client *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                  Project (Optional)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                >
                  <option value="">Select Project (Optional)</option>
                  {projects
                    .filter((p) => !clientId || p.client_id === clientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.project_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                  Contract Title *
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                    Deposit Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                    Duration / Sprints
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Weeks"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                  Signatory Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                  Signatory Email Address *
                </label>
                <input
                  required
                  type="email"
                  placeholder="signer@company.com"
                  value={signatoryEmail}
                  onChange={(e) => setSignatoryEmail(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
            </div>

            {/* Editable Terms Box */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                Contract Clauses & Terms (Editable)
              </label>
              <textarea
                rows={6}
                value={termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-background text-gray-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-accent outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Generating & Dispatching...' : 'Dispatch Agreement →'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="p-16 text-center text-gray-500 dark:text-gray-400">
            <FileSignature className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Contracts Found</h3>
            <p className="text-sm mt-1">Create a new contract or check your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-extrabold">
                  <th className="p-4">Agreement / Title</th>
                  <th className="p-4">Client & Project</th>
                  <th className="p-4">Signatory</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                {filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">{c.title}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {c.contract_type} · Sent {new Date(c.sent_at || c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">{c.client_name || 'Client'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{c.project_name || 'Direct Scope'}</div>
                    </td>
                    <td className="p-4 text-xs text-gray-700 dark:text-gray-300">
                      <div className="font-bold">{c.signer_name || c.signatory_email}</div>
                      <div className="text-gray-400">{c.signatory_email}</div>
                    </td>
                    <td className="p-4 text-xs font-bold text-accent">
                      {c.amount > 0
                        ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: c.currency || 'NGN' }).format(Number(c.amount))
                        : 'Milestone'}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider inline-block ${
                          c.status === 'SIGNED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {c.signing_token && (
                        <button
                          onClick={() => handleCopySigningLink(c.signing_token)}
                          className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors inline-block cursor-pointer"
                          title="Copy Public Signing Link"
                        >
                          {copiedToken === c.signing_token ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedContract(c)}
                        className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors inline-block cursor-pointer"
                        title="View Details & Audit Trail"
                      >
                        <Eye size={16} />
                      </button>

                      <a
                        href={`/api/contracts/${c.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors inline-block"
                        title="Download / Print Contract"
                      >
                        <Download size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract Detail & Audit Trail Modal */}
      <AnimatePresence>
        {selectedContract && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                    {selectedContract.contract_type} AGREEMENT
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedContract.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs">
                <div>
                  <div className="text-gray-400 uppercase font-mono font-bold">Current Status</div>
                  <div className="font-extrabold text-sm text-gray-900 dark:text-white mt-0.5">
                    {selectedContract.status}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 uppercase font-mono font-bold">Document Value</div>
                  <div className="font-extrabold text-sm text-accent mt-0.5">
                    {selectedContract.amount > 0
                      ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: selectedContract.currency || 'NGN' }).format(Number(selectedContract.amount))
                      : 'Milestone'}
                  </div>
                </div>
                {selectedContract.signing_token && selectedContract.status === 'SENT' && (
                  <button
                    type="button"
                    onClick={() => handleCopySigningLink(selectedContract.signing_token)}
                    className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Signing Link
                  </button>
                )}
              </div>

              {/* Digital Signature block if signed */}
              {selectedContract.status === 'SIGNED' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Signatory: {selectedContract.signer_name}</span>
                  </div>
                  {selectedContract.signature_data && (
                    <div className="p-2 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 inline-block">
                      <img
                        src={selectedContract.signature_data}
                        alt="Signature"
                        className="h-12 w-auto object-contain dark:invert"
                      />
                    </div>
                  )}
                  {selectedContract.contract_hash && (
                    <div className="text-[10px] font-mono text-gray-500 break-all">
                      SHA-256: <strong>{selectedContract.contract_hash}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Certified Audit Trail */}
              <div className="space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-gray-400 tracking-wider">
                  Certified Audit Log (Postgres Immutable)
                </div>
                <div className="space-y-2.5">
                  {(Array.isArray(selectedContract.audit_trail) ? selectedContract.audit_trail : []).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded mr-2">
                            {item.event}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">{item.details}</span>
                          {item.ip && (
                            <div className="text-[10px] text-gray-400 font-mono mt-1">
                              IP: {item.ip} {item.userAgent ? `· ${item.userAgent.slice(0, 45)}...` : ''}
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 whitespace-nowrap font-mono">
                          {new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                <a
                  href={`/api/contracts/${selectedContract.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary py-2 px-4 text-xs inline-flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print / Download Contract
                </a>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
