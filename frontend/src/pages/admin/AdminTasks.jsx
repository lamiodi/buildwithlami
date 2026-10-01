import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const STATUSES = ['TODO', 'IN_PROGRESS', 'WAITING', 'REVIEW', 'DONE', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const PRIORITY_STYLES = {
  URGENT: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  HIGH: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  MEDIUM: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  LOW: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

const STATUS_STYLES = {
  TODO: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  WAITING: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  REVIEW: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  DONE: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  CANCELLED: 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
};

const SCOPES = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'today', label: 'Due Today' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'open', label: 'All Open' },
  { id: 'all', label: 'Everything' },
];

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
const fmtTime = (m) => m ? (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ''}`.trim() : `${m}m`) : '';

const emptyForm = {
  title: '', description: '', project_id: '', priority: 'MEDIUM',
  status: 'TODO', due_at: '', estimated_minutes: '', blocked: false, blocked_reason: '',
};

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [scope, setScope] = useState('tonight');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setError(null);
    const params = {};
    // 'all' scope + no status filter shows every row server-side.
    if (scope !== 'all') params.scope = scope;
    if (searchQuery.trim().length >= 2) params.q = searchQuery.trim();
    const res = await api.get('/tasks', { params });
    if (res.ok && res.data) setTasks(res.data);
    else if (!res.ok) setError(res.error || 'Failed to fetch tasks.');
    setLoading(false);
  }, [scope, searchQuery]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 250);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  useEffect(() => {
    // Project picker for linking tasks to a client project.
    api.get('/client-projects').then((res) => {
      if (res.ok && Array.isArray(res.data)) setProjects(res.data);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setShowForm(true);
    setForm({
      title: task.title || '',
      description: task.description || '',
      project_id: task.project_id || '',
      priority: task.priority || 'MEDIUM',
      status: task.status || 'TODO',
      due_at: task.due_at ? new Date(task.due_at).toISOString().slice(0, 10) : '',
      estimated_minutes: task.estimated_minutes || '',
      blocked: !!task.blocked,
      blocked_reason: task.blocked_reason || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notify.error('Title is required');
      return;
    }
    const payload = {
      ...form,
      project_id: form.project_id || null,
      due_at: form.due_at || null,
      estimated_minutes: form.estimated_minutes ? Number(form.estimated_minutes) : null,
    };
    const res = editingId
      ? await api.patch(`/tasks/${editingId}`, payload)
      : await api.post('/tasks', payload);
    if (res.ok && res.data) {
      notify.success(editingId ? 'Task updated!' : 'Task created!');
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      fetchTasks();
    } else {
      notify.error(res.error || 'Error saving task.');
    }
  };

  const toggleDone = async (task) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const res = await api.patch(`/tasks/${task.id}`, { status: nextStatus });
    if (res.ok) {
      notify.success(nextStatus === 'DONE' ? 'Task completed 🎉' : 'Task reopened');
      fetchTasks();
    } else {
      notify.error(res.error || 'Error updating task.');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    const res = await api.delete(`/tasks/${id}`);
    if (res.ok) {
      notify.success('Task deleted');
      fetchTasks();
    } else {
      notify.error(res.error || 'Error deleting task.');
    }
  };

  // The 'tonight' scope is already server-filtered to tonight-queue
  // work (due today/overdue or URGENT), so the badge is just the
  // result length — no client-side clock math during render.
  const tonightCount = scope === 'tonight' ? tasks.length : 0;

  return (
    <div className="flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white font-heading">
              Tasks
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">
              Your working queue — what gets built tonight.
            </p>
          </div>
          <button
            onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((s) => !s); }}
            className="bg-accent hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body"
          >
            {showForm ? 'Close Form' : '+ New Task'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors font-body ${
                scope === s.id
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {s.label}{s.id === 'tonight' && tonightCount > 0 ? ` · ${tonightCount}` : ''}
            </button>
          ))}
          <div className="relative ml-auto w-full md:w-64">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" /></svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {showForm && (
            <div className="bg-white dark:bg-[#1c1c1c] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">
                {editingId ? 'Edit Task' : 'New Task'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Task Title</label>
                  <input type="text" name="title" required value={form.title} onChange={handleChange}
                    placeholder="e.g. Fix production checkout" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description (Optional)</label>
                  <textarea name="description" rows="2" value={form.description} onChange={handleChange}
                    placeholder="Context, links, acceptance criteria..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Client Project (Optional)</label>
                  <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                    <option value="">— None —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.project_name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                      {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Due Date</label>
                    <input type="date" name="due_at" value={form.due_at} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Est. Minutes</label>
                    <input type="number" min="1" name="estimated_minutes" value={form.estimated_minutes} onChange={handleChange}
                      placeholder="45" className={inputClass} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="blocked" name="blocked" checked={form.blocked} onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
                  <label htmlFor="blocked" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-body">Blocked</label>
                </div>
                {form.blocked && (
                  <div>
                    <label className={labelClass}>Blocked Reason</label>
                    <input type="text" name="blocked_reason" value={form.blocked_reason} onChange={handleChange}
                      placeholder="Waiting on client assets..." className={inputClass} />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="submit"
                    className="flex-1 bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
                    {editingId ? 'Update Task' : 'Create Task'}
                  </button>
                  {editingId && (
                    <button type="button"
                      onClick={() => { setEditingId(null); setForm(emptyForm); }}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl transition-all text-sm font-bold font-body">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className={showForm ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
            {loading ? (
              <div className="bg-white dark:bg-[#1c1c1c] p-8 rounded-2xl border border-gray-100 dark:border-gray-800/60 text-center text-gray-400 font-body">
                Loading tasks...
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-[#1c1c1c] p-8 rounded-2xl border border-gray-100 dark:border-gray-800/60 text-center text-red-500 font-body">
                {error}
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1c] p-12 rounded-2xl border border-gray-100 dark:border-gray-800/60 text-center font-body">
                <p className="text-gray-500 dark:text-gray-400">No tasks here. {scope === 'tonight' && 'Nothing due tonight — create something or enjoy the evening. 🌙'}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                        <th className="py-4 px-4 w-10"></th>
                        <th className="py-4 px-4">Task</th>
                        <th className="py-4 px-4">Project / Client</th>
                        <th className="py-4 px-4 text-center">Priority</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-center">Due</th>
                        <th className="py-4 px-4 text-center">Est.</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {tasks.map((task) => {
                        const overdue = task.due_at && new Date(task.due_at) < new Date() && task.status !== 'DONE';
                        return (
                          <tr key={task.id} className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${task.status === 'DONE' ? 'opacity-50' : ''}`}>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => toggleDone(task)}
                                title={task.status === 'DONE' ? 'Reopen task' : 'Mark complete'}
                                className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                  task.status === 'DONE'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-accent'
                                }`}
                              >
                                {task.status === 'DONE' && (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            </td>
                            <td className="py-4 px-4 max-w-xs">
                              <p className={`font-bold text-gray-900 dark:text-white font-body ${task.status === 'DONE' ? 'line-through' : ''}`}>
                                {task.title}
                              </p>
                              {task.blocked && (
                                <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                                  Blocked{task.blocked_reason ? `: ${task.blocked_reason}` : ''}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {task.project_id ? (
                                <Link to={`/admin/projects/${task.project_id}`} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline font-body">
                                  {task.project_name || 'Project'}
                                </Link>
                              ) : (
                                <span className="text-sm text-gray-400 font-body">{task.client_name || '—'}</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM}`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${STATUS_STYLES[task.status] || STATUS_STYLES.TODO}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className={`py-4 px-4 text-center text-sm font-body font-bold ${overdue ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                              {fmtDate(task.due_at)}
                              {overdue && <span className="block text-[9px] font-extrabold uppercase tracking-widest">Overdue</span>}
                            </td>
                            <td className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400 font-body">
                              {fmtTime(task.estimated_minutes)}
                            </td>
                            <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                              <button onClick={() => startEdit(task)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">
                                Edit
                              </button>
                              <button onClick={() => deleteTask(task.id)}
                                className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTasks;
