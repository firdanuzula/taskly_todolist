import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

// ─── helpers ────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token");
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d={d} />
  </svg>
);
const CheckIcon    = (p) => <Icon d="M20 6L9 17l-5-5" {...p} />;
const TrashIcon    = (p) => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" {...p} />;
const EditIcon     = (p) => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" {...p} />;
const LogoutIcon   = (p) => <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p} />;
const PlusIcon     = (p) => <Icon d="M12 5v14M5 12h14" {...p} />;
const CloseIcon    = (p) => <Icon d="M18 6L6 18M6 6l12 12" {...p} />;
const SaveIcon     = (p) => <Icon d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" {...p} />;
const UserIcon     = (p) => <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" {...p} />;
const LockIcon     = (p) => <Icon d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM17 11V7a5 5 0 00-10 0v4" {...p} />;
const MailIcon     = (p) => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" {...p} />;
const TaskIcon     = (p) => <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" {...p} />;
const EmptyIcon    = (p) => <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" {...p} />;

// ─── CSS VARIABLES ──────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:         #0f1117;
      --surface:    #1a1d27;
      --surface2:   #222534;
      --border:     #2e3247;
      --accent:     #6366f1;
      --accent-dim: #4f52cc;
      --accent-glow: rgba(99,102,241,.15);
      --green:      #22c55e;
      --red:        #ef4444;
      --amber:      #f59e0b;
      --text:       #e8eaf0;
      --muted:      #7c8098;
      --radius:     12px;
      --shadow:     0 4px 24px rgba(0,0,0,.4);
    }

    html { font-size: 16px; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }

    /* scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    /* selection */
    ::selection { background: var(--accent); color: #fff; }

    /* auth page */
    .auth-bg {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,.18) 0%, transparent 60%),
        var(--bg);
    }

    .auth-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 44px 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: var(--shadow), 0 0 60px rgba(99,102,241,.06);
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .auth-logo-icon {
      width: 40px; height: 40px;
      background: var(--accent);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }

    .auth-logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -.02em;
      color: var(--text);
    }

    .auth-heading {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -.03em;
      color: var(--text);
      margin-bottom: 6px;
    }

    .auth-subtext {
      color: var(--muted);
      font-size: .9rem;
      margin-bottom: 32px;
    }

    .tab-row {
      display: flex;
      background: var(--surface2);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 28px;
    }

    .tab-btn {
      flex: 1;
      padding: 9px 0;
      border: none;
      background: transparent;
      color: var(--muted);
      border-radius: 8px;
      font-size: .9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all .2s;
    }

    .tab-btn.active {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 2px 12px rgba(99,102,241,.4);
    }

    .field {
      margin-bottom: 18px;
    }

    .field label {
      display: block;
      font-size: .82rem;
      font-weight: 600;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 8px;
    }

    .input-wrap {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      pointer-events: none;
    }

    .input-wrap input {
      width: 100%;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px 12px 42px;
      color: var(--text);
      font-size: .95rem;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }

    .input-wrap input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .input-wrap input::placeholder { color: var(--muted); opacity: .7; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      font-size: .95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all .2s;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
      width: 100%;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(99,102,241,.3);
    }

    .btn-primary:hover { background: var(--accent-dim); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,.4); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }

    .btn-ghost {
      background: transparent;
      color: var(--muted);
      border: 1px solid var(--border);
    }

    .btn-ghost:hover { color: var(--text); border-color: var(--muted); background: var(--surface2); }

    .btn-icon {
      padding: 8px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      color: var(--muted);
      cursor: pointer;
      transition: all .2s;
      display: flex; align-items: center;
    }

    .btn-icon:hover { background: var(--surface2); border-color: var(--border); color: var(--text); }
    .btn-icon.danger:hover { color: var(--red); border-color: rgba(239,68,68,.3); background: rgba(239,68,68,.08); }
    .btn-icon.edit:hover { color: var(--accent); border-color: rgba(99,102,241,.3); background: var(--accent-glow); }

    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: .9rem;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .alert-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #fca5a5; }
    .alert-success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: #86efac; }

    /* ── MAIN APP ── */
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      position: sticky; top: 0; z-index: 100;
      background: rgba(26,29,39,.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .topbar-logo {
      display: flex; align-items: center; gap: 10px;
      font-size: 1.1rem; font-weight: 700; letter-spacing: -.02em;
      text-decoration: none; color: var(--text);
    }

    .topbar-logo-icon {
      width: 32px; height: 32px;
      background: var(--accent);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }

    .topbar-right {
      display: flex; align-items: center; gap: 12px;
    }

    .topbar-user {
      font-size: .85rem;
      color: var(--muted);
    }

    .topbar-user strong { color: var(--text); }

    .main-content {
      flex: 1;
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      padding: 40px 24px;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -.03em;
      margin-bottom: 4px;
    }

    .page-subtitle {
      color: var(--muted);
      font-size: .9rem;
    }

    /* stats row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
      text-align: center;
    }

    .stat-number {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -.04em;
    }

    .stat-number.total { color: var(--text); }
    .stat-number.done  { color: var(--green); }
    .stat-number.todo  { color: var(--accent); }

    .stat-label {
      font-size: .78rem;
      color: var(--muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: .05em;
      margin-top: 2px;
    }

    /* add task form */
    .add-form {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 24px;
    }

    .add-form-row {
      display: flex;
      gap: 10px;
    }

    .task-input {
      flex: 1;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      color: var(--text);
      font-size: .95rem;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }

    .task-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .task-input::placeholder { color: var(--muted); opacity: .7; }

    .task-input-desc {
      width: 100%;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 16px;
      color: var(--text);
      font-size: .9rem;
      outline: none;
      resize: none;
      font-family: inherit;
      margin-top: 10px;
      transition: border-color .2s, box-shadow .2s;
    }

    .task-input-desc:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .task-input-desc::placeholder { color: var(--muted); opacity: .7; }

    /* filters */
    .filter-row {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      font-size: .85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all .2s;
    }

    .filter-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .filter-btn:not(.active):hover {
      border-color: var(--muted);
      color: var(--text);
    }

    /* task list */
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .task-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      transition: border-color .2s, transform .15s;
    }

    .task-card:hover { border-color: var(--accent); transform: translateY(-1px); }
    .task-card.done { opacity: .6; }
    .task-card.done .task-title { text-decoration: line-through; color: var(--muted); }

    .task-check {
      flex-shrink: 0;
      margin-top: 2px;
      width: 22px; height: 22px;
      border-radius: 50%;
      border: 2px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all .2s;
      background: transparent;
    }

    .task-check:hover { border-color: var(--green); }
    .task-check.checked { background: var(--green); border-color: var(--green); }

    .task-body { flex: 1; min-width: 0; }

    .task-title {
      font-size: .97rem;
      font-weight: 500;
      color: var(--text);
      line-height: 1.4;
      word-break: break-word;
    }

    .task-desc {
      font-size: .83rem;
      color: var(--muted);
      margin-top: 4px;
      line-height: 1.5;
      word-break: break-word;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }

    .task-badge {
      font-size: .72rem;
      font-weight: 600;
      letter-spacing: .04em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 20px;
    }

    .task-badge.done { background: rgba(34,197,94,.15); color: var(--green); }
    .task-badge.pending { background: rgba(99,102,241,.15); color: var(--accent); }

    .task-date {
      font-size: .78rem;
      color: var(--muted);
    }

    .task-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    /* empty state */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--muted);
    }

    .empty-icon-wrap {
      width: 64px; height: 64px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 6px;
    }

    .empty-text {
      font-size: .875rem;
    }

    /* EDIT MODAL */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.65);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 200;
      padding: 24px;
      animation: fadeIn .15s ease;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    .modal-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 32px;
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow);
      animation: slideUp .2s ease;
    }

    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -.02em;
    }

    .modal-body { display: flex; flex-direction: column; gap: 14px; }

    .modal-field label {
      display: block;
      font-size: .8rem;
      font-weight: 600;
      letter-spacing: .05em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 7px;
    }

    .modal-field input,
    .modal-field textarea {
      width: 100%;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      color: var(--text);
      font-size: .93rem;
      outline: none;
      font-family: inherit;
      transition: border-color .2s, box-shadow .2s;
    }

    .modal-field textarea {
      resize: vertical; min-height: 90px;
    }

    .modal-field input:focus,
    .modal-field textarea:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    .modal-field input::placeholder,
    .modal-field textarea::placeholder { color: var(--muted); opacity: .7; }

    .modal-status-row {
      display: flex; gap: 10px;
    }

    .status-option {
      flex: 1;
      padding: 10px;
      border: 2px solid var(--border);
      border-radius: 10px;
      background: transparent;
      cursor: pointer;
      transition: all .2s;
      text-align: center;
    }

    .status-option.sel-todo { border-color: var(--accent); background: var(--accent-glow); color: var(--accent); font-weight: 600; font-size: .88rem; }
    .status-option.sel-done { border-color: var(--green); background: rgba(34,197,94,.1); color: var(--green); font-weight: 600; font-size: .88rem; }
    .status-option:not(.sel-todo):not(.sel-done) { color: var(--muted); font-size: .88rem; }
    .status-option:hover:not(.sel-todo):not(.sel-done) { border-color: var(--muted); color: var(--text); }

    .modal-footer {
      display: flex; gap: 10px; justify-content: flex-end;
      margin-top: 24px;
    }

    /* loading */
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
      display: inline-block;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* progress bar */
    .progress-wrap {
      background: var(--surface2);
      border-radius: 99px;
      height: 4px;
      overflow: hidden;
      margin-top: 8px;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--green));
      border-radius: 99px;
      transition: width .4s ease;
    }

    /* toast */
    .toast {
      position: fixed;
      bottom: 24px; right: 24px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 20px;
      font-size: .9rem;
      font-weight: 500;
      box-shadow: var(--shadow);
      z-index: 999;
      animation: slideUp .25s ease;
      display: flex; align-items: center; gap: 10px;
      max-width: 320px;
    }

    .toast.success { border-left: 3px solid var(--green); }
    .toast.error   { border-left: 3px solid var(--red); }

    @media (max-width: 500px) {
      .auth-card { padding: 32px 24px; }
      .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .stat-card { padding: 12px; }
      .stat-number { font-size: 1.4rem; }
      .topbar { padding: 0 16px; }
      .main-content { padding: 24px 16px; }
      .add-form-row { flex-direction: column; }
    }
  `}</style>
);

// ─── TOAST ──────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`toast ${type}`}>
      {type === "success" ? <CheckIcon size={16} color="var(--green)" /> : null}
      {msg}
    </div>
  );
}

// ─── EDIT MODAL ─────────────────────────────────────────────────────────────
function EditModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status || "pending");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setErr("Title is required."); return; }
    setSaving(true);
    setErr("");
    try {
      await axios.put(`${API}/tasks/${task.id}`,
        { title: title.trim(), description: description.trim(), status },
        { headers: authHeader() }
      );
      onSave({ ...task, title: title.trim(), description: description.trim(), status });
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // close on ESC
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <span className="modal-title">Edit Task</span>
          <button className="btn-icon" onClick={onClose}><CloseIcon size={18} /></button>
        </div>

        <div className="modal-body">
          {err && <div className="alert alert-error">{err}</div>}

          <div className="modal-field">
            <label>Task title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div className="modal-field">
            <label>Description <span style={{fontWeight:400,textTransform:"none",color:"var(--muted)"}}>(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="modal-field">
            <label>Status</label>
            <div className="modal-status-row">
              <button
                className={`status-option ${status === "pending" ? "sel-todo" : ""}`}
                onClick={() => setStatus("pending")}
              >In Progress</button>
              <button
                className={`status-option ${status === "completed" ? "sel-done" : ""}`}
                onClick={() => setStatus("completed")}
              >Completed</button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{width:"auto"}}>
            {saving ? <span className="spinner" /> : <SaveIcon size={16} />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH PAGE ───────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setErr(""); setMsg("");
    if (!email || !password) { setErr("Please fill all fields."); return; }
    if (mode === "register" && !username.trim()) { setErr("Username is required."); return; }
    setLoading(true);
    try {
      const url = `${API}/auth/${mode}`;
      const body = mode === "login"
        ? { email, password }
        : { username, email, password };
      const { data } = await axios.post(url, body);
      if (mode === "register") {
        setMsg("Account created! Please sign in.");
        setMode("login");
        setPassword("");
      } else {
        localStorage.setItem("token", data.token);
        onLogin(data.user);
      }
    } catch (e) {
      setErr(e.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <TaskIcon size={20} color="#fff" />
            </div>
            <span className="auth-logo-text">Taskly</span>
          </div>

          <div className="tab-row">
            <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setErr(""); setMsg(""); }}>Sign in</button>
            <button className={`tab-btn ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setErr(""); setMsg(""); }}>Create account</button>
          </div>

          {err && <div className="alert alert-error">{err}</div>}
          {msg && <div className="alert alert-success">{msg}</div>}

          {mode === "register" && (
            <div className="field">
              <label>Username</label>
              <div className="input-wrap">
                <span className="input-icon"><UserIcon size={16} /></span>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="your_name" />
              </div>
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <div className="input-wrap">
              <span className="input-icon"><MailIcon size={16} /></span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <span className="input-icon"><LockIcon size={16} /></span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {mode === "login" ? (loading ? "Signing in…" : "Sign in") : (loading ? "Creating account…" : "Create account")}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function MainApp({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  const [editTask, setEditTask] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/tasks`, { headers: authHeader() });
      setTasks(data);
    } catch {
      showToast("Failed to load tasks.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = async () => {
    if (!title.trim()) return;
    setAdding(true);
    try {
      const { data } = await axios.post(`${API}/tasks`,
        { title: title.trim(), description: desc.trim() },
        { headers: authHeader() }
      );
      setTasks(prev => [data, ...prev]);
      setTitle(""); setDesc("");
      showToast("Task added.");
    } catch {
      showToast("Failed to add task.", "error");
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      await axios.put(`${API}/tasks/${task.id}`,
        { ...task, status: newStatus },
        { headers: authHeader() }
      );
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      showToast(newStatus === "completed" ? "Marked complete!" : "Marked in progress.");
    } catch {
      showToast("Failed to update.", "error");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`, { headers: authHeader() });
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast("Task deleted.");
    } catch {
      showToast("Failed to delete.", "error");
    }
  };

  const handleEditSave = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditTask(null);
    showToast("Task updated.");
  };

  const filtered = tasks.filter(t =>
    filter === "all" ? true :
    filter === "pending" ? t.status === "pending" :
    t.status === "completed"
  );

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "completed").length;
  const pending = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const formatDate = (s) => {
    if (!s) return "";
    return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      <GlobalStyles />
      <div className="app-layout">
        {/* topbar */}
        <header className="topbar">
          <div className="topbar-logo">
            <div className="topbar-logo-icon">
              <TaskIcon size={16} color="#fff" />
            </div>
            Taskly
          </div>
          <div className="topbar-right">
            <span className="topbar-user">Hello, <strong>{user.username || user.email}</strong></span>
            <button className="btn-icon" title="Sign out" onClick={onLogout}>
              <LogoutIcon size={18} />
            </button>
          </div>
        </header>

        {/* main */}
        <main className="main-content">
          <div className="page-header">
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">{total === 0 ? "No tasks yet. Add one below." : `${done} of ${total} completed — ${pct}%`}</p>
            {total > 0 && (
              <div className="progress-wrap" style={{marginTop:10}}>
                <div className="progress-bar" style={{width:`${pct}%`}} />
              </div>
            )}
          </div>

          {/* stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number total">{total}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-number done">{done}</div>
              <div className="stat-label">Done</div>
            </div>
            <div className="stat-card">
              <div className="stat-number todo">{pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          {/* add form */}
          <div className="add-form">
            <div className="add-form-row">
              <input
                className="task-input"
                placeholder="Add a new task…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && addTask()}
              />
              <button className="btn btn-primary" onClick={addTask} disabled={adding || !title.trim()} style={{width:"auto"}}>
                {adding ? <span className="spinner" /> : <PlusIcon size={18} />}
                Add
              </button>
            </div>
            <textarea
              className="task-input-desc"
              placeholder="Optional description…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
            />
          </div>

          {/* filters */}
          <div className="filter-row">
            {["all","pending","completed"].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : f === "pending" ? "In Progress" : "Completed"}
                {" "}
                <span style={{opacity:.7}}>
                  ({f === "all" ? total : f === "pending" ? pending : done})
                </span>
              </button>
            ))}
          </div>

          {/* list */}
          {loading ? (
            <div style={{textAlign:"center",padding:"60px 0",color:"var(--muted)"}}>
              <span className="spinner" style={{borderColor:"var(--border)",borderTopColor:"var(--accent)"}} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <EmptyIcon size={28} color="var(--muted)" />
              </div>
              <div className="empty-title">No tasks here</div>
              <div className="empty-text">
                {filter === "all" ? "Add your first task above." : `No ${filter === "pending" ? "in-progress" : "completed"} tasks.`}
              </div>
            </div>
          ) : (
            <div className="task-list">
              {filtered.map(task => (
                <div key={task.id} className={`task-card ${task.status === "completed" ? "done" : ""}`}>
                  {/* check circle */}
                  <button
                    className={`task-check ${task.status === "completed" ? "checked" : ""}`}
                    onClick={() => toggleTask(task)}
                    title={task.status === "completed" ? "Mark pending" : "Mark complete"}
                  >
                    {task.status === "completed" && <CheckIcon size={12} color="#fff" />}
                  </button>

                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <div className="task-desc">{task.description}</div>
                    )}
                    <div className="task-meta">
                      <span className={`task-badge ${task.status === "completed" ? "done" : "pending"}`}>
                        {task.status === "completed" ? "Done" : "In Progress"}
                      </span>
                      {task.created_at && (
                        <span className="task-date">{formatDate(task.created_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      className="btn-icon edit"
                      title="Edit task"
                      onClick={() => setEditTask(task)}
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete task"
                      onClick={() => deleteTask(task.id)}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {editTask && (
        <EditModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      // verify token
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (checking) {
    return (
      <>
        <GlobalStyles />
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--bg)"}}>
          <span className="spinner" style={{width:32,height:32,borderColor:"var(--border)",borderTopColor:"var(--accent)"}} />
        </div>
      </>
    );
  }

  if (!user) return <AuthPage onLogin={setUser} />;
  return <MainApp user={user} onLogout={handleLogout} />;
}
