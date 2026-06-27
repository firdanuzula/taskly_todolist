import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const token     = () => localStorage.getItem("token");
const authHdr   = () => ({ Authorization: `Bearer ${token()}` });

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = "currentColor", fill = "none", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
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
const SearchIcon   = (p) => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" {...p} />;
const SortIcon     = (p) => <Icon d="M3 6h18M7 12h10M11 18h2" {...p} />;
const CalendarIcon = (p) => <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" {...p} />;
const FlagIcon     = (p) => <Icon d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" {...p} />;
const ChevronIcon  = (p) => <Icon d="M6 9l6 6 6-6" {...p} />;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const today    = () => new Date().toISOString().split("T")[0];
const isOverdue = (due) => due && due < today() ;

const formatDate = (s) => {
  if (!s) return "";
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const PRIORITY_META = {
  high:   { label: "Tinggi",  color: "#ef4444", bg: "rgba(239,68,68,.12)"   },
  medium: { label: "Sedang",  color: "#f59e0b", bg: "rgba(245,158,11,.12)"  },
  low:    { label: "Rendah",  color: "#22c55e", bg: "rgba(34,197,94,.12)"   },
};

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:           #0f1117;
      --surface:      #1a1d27;
      --surface2:     #222534;
      --surface3:     #282b3e;
      --border:       #2e3247;
      --accent:       #6366f1;
      --accent-dim:   #4f52cc;
      --accent-glow:  rgba(99,102,241,.15);
      --green:        #22c55e;
      --red:          #ef4444;
      --amber:        #f59e0b;
      --text:         #e8eaf0;
      --muted:        #7c8098;
      --radius:       12px;
      --shadow:       0 4px 24px rgba(0,0,0,.4);
    }

    html { font-size: 16px; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::selection { background: var(--accent); color: #fff; }

    /* ── Auth ── */
    .auth-bg {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
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
      width: 100%; max-width: 420px;
      box-shadow: var(--shadow), 0 0 60px rgba(99,102,241,.06);
    }
    .auth-logo {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 32px;
    }
    .auth-logo-icon {
      width: 40px; height: 40px;
      background: var(--accent);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .auth-logo-text { font-size: 22px; font-weight: 700; }
    .auth-tabs {
      display: flex; gap: 4px;
      background: var(--surface2);
      border-radius: 10px; padding: 4px;
      margin-bottom: 28px;
    }
    .auth-tab {
      flex: 1; padding: 8px; border: none; cursor: pointer;
      border-radius: 7px; font-size: 14px; font-weight: 500;
      background: transparent; color: var(--muted);
      transition: all .2s;
    }
    .auth-tab.active { background: var(--accent); color: #fff; }

    .field-group { display: flex; flex-direction: column; gap: 16px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 6px; }
    .field-wrap { position: relative; }
    .field-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: var(--muted); pointer-events: none;
    }
    .field-input {
      width: 100%; padding: 12px 14px 12px 42px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-size: 14px;
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .field-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .btn-primary {
      width: 100%; padding: 13px;
      background: var(--accent); color: #fff;
      border: none; border-radius: 10px;
      font-size: 15px; font-weight: 600; cursor: pointer;
      margin-top: 24px;
      transition: background .2s, transform .1s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-primary:hover { background: var(--accent-dim); }
    .btn-primary:active { transform: scale(.98); }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
    .auth-error {
      background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
      color: #fca5a5; border-radius: 8px; padding: 10px 14px;
      font-size: 13px; margin-bottom: 16px;
    }

    /* ── Layout ── */
    .app-layout { min-height: 100vh; display: flex; flex-direction: column; }

    .topbar {
      position: sticky; top: 0; z-index: 50;
      background: rgba(15,17,23,.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      height: 60px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .topbar-logo {
      display: flex; align-items: center; gap: 10px;
      font-size: 18px; font-weight: 700;
    }
    .topbar-logo-icon {
      width: 32px; height: 32px; background: var(--accent);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
    }
    .topbar-right { display: flex; align-items: center; gap: 12px; }
    .topbar-user { font-size: 14px; color: var(--muted); }

    .main-content {
      flex: 1; max-width: 800px; width: 100%;
      margin: 0 auto; padding: 32px 24px 64px;
    }

    /* ── Page header ── */
    .page-header { margin-bottom: 28px; }
    .page-title { font-size: 26px; font-weight: 700; }
    .page-subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }
    .progress-wrap {
      height: 6px; background: var(--surface2);
      border-radius: 99px; overflow: hidden;
    }
    .progress-bar {
      height: 100%; background: linear-gradient(90deg, var(--accent), #a78bfa);
      border-radius: 99px;
      transition: width .5s ease;
    }

    /* ── Stats ── */
    .stats-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 12px; margin-bottom: 24px;
    }
    .stat-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px;
      text-align: center;
    }
    .stat-number { font-size: 28px; font-weight: 700; }
    .stat-number.total  { color: var(--accent); }
    .stat-number.done   { color: var(--green); }
    .stat-number.todo   { color: var(--amber); }
    .stat-number.overdue { color: var(--red); }
    .stat-label { font-size: 12px; color: var(--muted); margin-top: 2px; }

    /* ── Toolbar (search + sort) ── */
    .toolbar {
      display: flex; gap: 10px; align-items: center;
      margin-bottom: 16px; flex-wrap: wrap;
    }
    .search-wrap {
      position: relative; flex: 1; min-width: 180px;
    }
    .search-icon {
      position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
      color: var(--muted); pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 9px 12px 9px 38px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-size: 14px;
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .sort-select {
      padding: 9px 32px 9px 12px;
      background: var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c8098' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat calc(100% - 10px) center;
      border: 1px solid var(--border); border-radius: 10px;
      color: var(--text); font-size: 14px; outline: none;
      cursor: pointer; appearance: none;
      transition: border-color .2s;
    }
    .sort-select:focus { border-color: var(--accent); }

    .order-btn {
      padding: 9px 12px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px; color: var(--muted); cursor: pointer;
      font-size: 13px; font-weight: 500;
      transition: all .2s; white-space: nowrap;
    }
    .order-btn:hover { border-color: var(--accent); color: var(--text); }

    /* ── Add form ── */
    .add-form {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px;
      margin-bottom: 20px;
    }
    .add-form-row {
      display: flex; gap: 10px; align-items: center; margin-bottom: 10px;
    }
    .task-input {
      flex: 1; padding: 10px 14px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-size: 14px;
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .task-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .task-input-desc {
      width: 100%; padding: 10px 14px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-size: 13px;
      outline: none; resize: vertical; font-family: inherit;
      transition: border-color .2s;
    }
    .task-input-desc:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    /* ── Add form extras row ── */
    .add-extras {
      display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;
    }
    .extra-field {
      display: flex; flex-direction: column; gap: 4px;
      flex: 1; min-width: 140px;
    }
    .extra-label {
      font-size: 11px; font-weight: 600; color: var(--muted);
      text-transform: uppercase; letter-spacing: .05em;
    }
    .extra-input {
      padding: 8px 12px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 8px; color: var(--text); font-size: 13px;
      outline: none; width: 100%;
      transition: border-color .2s;
    }
    .extra-input:focus { border-color: var(--accent); }
    .extra-select {
      padding: 8px 28px 8px 12px;
      background: var(--surface2) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c8098' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat calc(100% - 8px) center;
      border: 1px solid var(--border); border-radius: 8px;
      color: var(--text); font-size: 13px; outline: none;
      appearance: none; cursor: pointer; width: 100%;
      transition: border-color .2s;
    }
    .extra-select:focus { border-color: var(--accent); }

    .btn {
      padding: 10px 18px;
      border: none; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      transition: background .2s, transform .1s;
    }
    .btn:active { transform: scale(.97); }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-accent {
      background: var(--accent); color: #fff;
      white-space: nowrap;
    }
    .btn-accent:hover:not(:disabled) { background: var(--accent-dim); }

    /* ── Filters ── */
    .filter-row {
      display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;
    }
    .filter-btn {
      padding: 7px 14px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 99px; color: var(--muted); font-size: 13px;
      cursor: pointer; transition: all .2s;
    }
    .filter-btn:hover { border-color: var(--accent); color: var(--text); }
    .filter-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }

    /* ── Task list ── */
    .task-list { display: flex; flex-direction: column; gap: 10px; }

    .task-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 16px 18px;
      display: flex; align-items: flex-start; gap: 14px;
      transition: border-color .2s, box-shadow .2s;
    }
    .task-card:hover {
      border-color: var(--border);
      box-shadow: 0 2px 12px rgba(0,0,0,.2);
    }
    .task-card.done { opacity: .65; }
    .task-card.priority-high  { border-left: 3px solid #ef4444; }
    .task-card.priority-medium{ border-left: 3px solid #f59e0b; }
    .task-card.priority-low   { border-left: 3px solid #22c55e; }

    .task-check {
      width: 22px; height: 22px; min-width: 22px;
      border: 2px solid var(--border); border-radius: 50%;
      background: transparent; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      margin-top: 1px;
      transition: all .2s;
    }
    .task-check:hover { border-color: var(--accent); }
    .task-check.checked { background: var(--green); border-color: var(--green); }

    .task-body { flex: 1; min-width: 0; }
    .task-title {
      font-size: 15px; font-weight: 500;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .task-card.done .task-title {
      text-decoration: line-through; color: var(--muted);
    }
    .task-desc {
      font-size: 13px; color: var(--muted); margin-top: 3px;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .task-meta {
      display: flex; align-items: center; gap: 8px;
      margin-top: 8px; flex-wrap: wrap;
    }
    .task-badge {
      font-size: 11px; font-weight: 600;
      padding: 2px 8px; border-radius: 99px;
      text-transform: uppercase; letter-spacing: .04em;
    }
    .task-badge.done    { background: rgba(34,197,94,.12); color: #22c55e; }
    .task-badge.pending { background: rgba(245,158,11,.12); color: #f59e0b; }

    .priority-badge {
      font-size: 11px; font-weight: 600;
      padding: 2px 8px; border-radius: 99px;
      display: flex; align-items: center; gap: 4px;
    }

    .due-badge {
      font-size: 11px; font-weight: 500;
      padding: 2px 8px; border-radius: 99px;
      display: flex; align-items: center; gap: 4px;
    }
    .due-badge.normal  { background: rgba(99,102,241,.12); color: #818cf8; }
    .due-badge.overdue { background: rgba(239,68,68,.12);  color: #f87171; }
    .due-badge.today   { background: rgba(245,158,11,.12); color: #fbbf24; }
    .task-date { font-size: 11px; color: var(--muted); }

    .task-actions {
      display: flex; align-items: center; gap: 4px;
      opacity: 0; transition: opacity .2s;
    }
    .task-card:hover .task-actions { opacity: 1; }

    .btn-icon {
      width: 32px; height: 32px;
      border: none; background: transparent; cursor: pointer;
      border-radius: 8px; color: var(--muted);
      display: flex; align-items: center; justify-content: center;
      transition: all .2s;
    }
    .btn-icon:hover { background: var(--surface2); color: var(--text); }
    .btn-icon.edit:hover  { color: var(--accent); }
    .btn-icon.danger:hover { color: var(--red); }

    /* ── Empty state ── */
    .empty-state {
      text-align: center; padding: 60px 0;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .empty-icon-wrap {
      width: 64px; height: 64px; border-radius: 20px;
      background: var(--surface); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
    }
    .empty-title { font-size: 16px; font-weight: 600; }
    .empty-text  { font-size: 13px; color: var(--muted); }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(0,0,0,.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .modal-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 20px; padding: 32px;
      width: 100%; max-width: 480px;
      box-shadow: var(--shadow);
      animation: modalIn .2s ease;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translateY(12px) scale(.97); }
      to   { opacity: 1; transform: none; }
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px;
    }
    .modal-title { font-size: 18px; font-weight: 700; }
    .modal-fields { display: flex; flex-direction: column; gap: 14px; }
    .modal-input {
      width: 100%; padding: 11px 14px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-size: 14px;
      outline: none; transition: border-color .2s;
    }
    .modal-input:focus { border-color: var(--accent); }
    .modal-textarea {
      width: 100%; padding: 11px 14px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-size: 13px;
      outline: none; resize: vertical; font-family: inherit;
      transition: border-color .2s;
    }
    .modal-textarea:focus { border-color: var(--accent); }
    .modal-row { display: flex; gap: 12px; }
    .modal-select {
      flex: 1; padding: 11px 28px 11px 14px;
      background: var(--surface2) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c8098' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat calc(100% - 10px) center;
      border: 1px solid var(--border); border-radius: 10px;
      color: var(--text); font-size: 14px; outline: none;
      appearance: none; cursor: pointer;
      transition: border-color .2s;
    }
    .modal-select:focus { border-color: var(--accent); }
    .modal-date {
      flex: 1; padding: 11px 14px;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text); font-size: 14px;
      outline: none; transition: border-color .2s;
      color-scheme: dark;
    }
    .modal-date:focus { border-color: var(--accent); }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      margin-top: 24px;
    }
    .btn-ghost {
      padding: 10px 18px;
      background: transparent; border: 1px solid var(--border);
      border-radius: 10px; color: var(--muted); font-size: 14px;
      cursor: pointer; transition: all .2s;
    }
    .btn-ghost:hover { border-color: var(--text); color: var(--text); }

    /* ── Toast ── */
    .toast {
      position: fixed; bottom: 28px; right: 28px; z-index: 200;
      padding: 12px 20px; border-radius: 12px;
      font-size: 14px; font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
      animation: toastIn .25s ease;
      display: flex; align-items: center; gap: 10px;
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }
    .toast.success { background: #14532d; color: #86efac; border: 1px solid #166534; }
    .toast.error   { background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; }

    /* ── Spinner ── */
    .spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff; border-radius: 50%;
      animation: spin .6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .main-content { padding: 20px 16px 48px; }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .modal-card { padding: 24px 20px; }
      .auth-card { padding: 32px 24px; }
      .modal-row { flex-direction: column; }
      .add-extras { flex-direction: column; }
      .topbar { padding: 0 16px; }
    }
  `}</style>
);

// ─── TOAST ──────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <div className={`toast ${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}

// ─── DUE DATE BADGE ─────────────────────────────────────────────────────────
function DueBadge({ due }) {
  if (!due) return null;
  const t = today();
  const cls = due < t ? "overdue" : due === t ? "today" : "normal";
  const label = due < t ? "Terlambat" : due === t ? "Hari ini" : formatDate(due);
  return (
    <span className={`due-badge ${cls}`}>
      <CalendarIcon size={10} />
      {label}
    </span>
  );
}

// ─── PRIORITY BADGE ─────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  if (!priority) return null;
  const m = PRIORITY_META[priority];
  return (
    <span className="priority-badge" style={{ background: m.bg, color: m.color }}>
      <FlagIcon size={10} />
      {m.label}
    </span>
  );
}

// ─── EDIT MODAL ─────────────────────────────────────────────────────────────
function EditModal({ task, onClose, onSave }) {
  const [title,    setTitle]    = useState(task.title);
  const [desc,     setDesc]     = useState(task.description || "");
  const [status,   setStatus]   = useState(task.status);
  const [dueDate,  setDueDate]  = useState(task.due_date ? task.due_date.split("T")[0] : "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) { setErr("Judul tidak boleh kosong."); return; }
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/tasks/${task.id}`,
        { title: title.trim(), description: desc.trim(), status, due_date: dueDate || null, priority },
        { headers: authHdr() }
      );
      onSave(data);
    } catch {
      setErr("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">Edit Task</h2>
          <button className="btn-icon" onClick={onClose}><CloseIcon size={18} /></button>
        </div>

        {err && <div className="auth-error" style={{marginBottom:12}}>{err}</div>}

        <div className="modal-fields">
          <input
            className="modal-input"
            placeholder="Judul task"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="modal-textarea"
            placeholder="Deskripsi (opsional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            rows={3}
          />

          <div className="modal-row">
            {/* Priority */}
            <div style={{flex:1, display:"flex", flexDirection:"column", gap:4}}>
              <span className="extra-label">Prioritas</span>
              <select className="modal-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="high">🔴 Tinggi</option>
                <option value="medium">🟡 Sedang</option>
                <option value="low">🟢 Rendah</option>
              </select>
            </div>

            {/* Status */}
            <div style={{flex:1, display:"flex", flexDirection:"column", gap:4}}>
              <span className="extra-label">Status</span>
              <select className="modal-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="pending">In Progress</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div style={{display:"flex", flexDirection:"column", gap:4}}>
            <span className="extra-label">Tenggat Waktu</span>
            <input
              type="date"
              className="modal-date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : <SaveIcon size={16} />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH PAGE ───────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab,      setTab]      = useState("login");
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async () => {
    setError("");
    if (!email || !password) { setError("Email dan password wajib diisi."); return; }
    if (tab === "register" && !username) { setError("Nama wajib diisi."); return; }
    setLoading(true);
    try {
      if (tab === "register") {
        await axios.post(`${API}/auth/register`, { username, email, password });
        setTab("login"); setUsername(""); setPassword(""); setError("");
        return;
      }
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (e) {
      setError(e.response?.data?.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <GlobalStyles />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><TaskIcon size={20} color="#fff" /></div>
          <span className="auth-logo-text">Taskly</span>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Masuk</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Daftar</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="field-group">
          {tab === "register" && (
            <div>
              <div className="field-label">Nama</div>
              <div className="field-wrap">
                <span className="field-icon"><UserIcon size={16} /></span>
                <input className="field-input" placeholder="Nama lengkap" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            </div>
          )}
          <div>
            <div className="field-label">Email</div>
            <div className="field-wrap">
              <span className="field-icon"><MailIcon size={16} /></span>
              <input className="field-input" type="email" placeholder="email@contoh.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
          </div>
          <div>
            <div className="field-label">Password</div>
            <div className="field-wrap">
              <span className="field-icon"><LockIcon size={16} /></span>
              <input className="field-input" type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {tab === "login" ? "Masuk" : "Buat Akun"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
function MainApp({ user, onLogout }) {
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [dueDate,  setDueDate]  = useState("");
  const [priority, setPriority] = useState("medium");
  const [adding,   setAdding]   = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("created_at");
  const [order,    setOrder]    = useState("desc");
  const [editTask, setEditTask] = useState(null);
  const [toast,    setToast]    = useState(null);
  const toastTimer = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const loadTasks = useCallback(async () => {
    try {
      const params = { sort, order };
      if (filter !== "all") params.status = filter;
      if (search.trim()) params.search = search.trim();
      const { data } = await axios.get(`${API}/tasks`, { headers: authHdr(), params });
      setTasks(data);
    } catch {
      showToast("Gagal memuat tasks.", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, search, sort, order]);

  // Debounce reload on search change
  useEffect(() => {
    const t = setTimeout(() => { loadTasks(); }, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [loadTasks, search]);

  const addTask = async () => {
    if (!title.trim()) return;
    setAdding(true);
    try {
      const { data } = await axios.post(`${API}/tasks`,
        { title: title.trim(), description: desc.trim(), due_date: dueDate || null, priority },
        { headers: authHdr() }
      );
      setTasks(prev => [data, ...prev]);
      setTitle(""); setDesc(""); setDueDate(""); setPriority("medium");
      showToast("Task berhasil ditambahkan.");
    } catch {
      showToast("Gagal menambah task.", "error");
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      const { data } = await axios.patch(`${API}/tasks/${task.id}/toggle`, {}, { headers: authHdr() });
      setTasks(prev => prev.map(t => t.id === task.id ? data : t));
      showToast(data.status === "completed" ? "Task selesai! ✓" : "Ditandai in progress.");
    } catch {
      showToast("Gagal update status.", "error");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Hapus task ini?")) return;
    try {
      await axios.delete(`${API}/tasks/${id}`, { headers: authHdr() });
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast("Task dihapus.");
    } catch {
      showToast("Gagal menghapus task.", "error");
    }
  };

  const handleEditSave = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditTask(null);
    showToast("Task berhasil diperbarui.");
  };

  // Stats
  const total   = tasks.length;
  const done    = tasks.filter(t => t.status === "completed").length;
  const pending = total - done;
  const overdue = tasks.filter(t => t.status === "pending" && isOverdue(t.due_date?.split("T")[0])).length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  const toggleOrder = () => setOrder(o => o === "desc" ? "asc" : "desc");

  return (
    <>
      <GlobalStyles />
      <div className="app-layout">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-logo">
            <div className="topbar-logo-icon"><TaskIcon size={16} color="#fff" /></div>
            Taskly
          </div>
          <div className="topbar-right">
            <span className="topbar-user">Halo, <strong>{user.username || user.email}</strong></span>
            <button className="btn-icon" title="Keluar" onClick={onLogout}>
              <LogoutIcon size={18} />
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="main-content">
          {/* Page header */}
          <div className="page-header">
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">
              {total === 0 ? "Belum ada task. Tambahkan di bawah." : `${done} dari ${total} selesai — ${pct}%`}
            </p>
            {total > 0 && (
              <div className="progress-wrap" style={{ marginTop: 10 }}>
                <div className="progress-bar" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number total">{total}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-number done">{done}</div>
              <div className="stat-label">Selesai</div>
            </div>
            <div className="stat-card">
              <div className="stat-number todo">{pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number overdue">{overdue}</div>
              <div className="stat-label">Terlambat</div>
            </div>
          </div>

          {/* Add form */}
          <div className="add-form">
            <div className="add-form-row">
              <input
                className="task-input"
                placeholder="Tambah task baru…"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && addTask()}
              />
              <button className="btn btn-accent" onClick={addTask} disabled={adding || !title.trim()}>
                {adding ? <span className="spinner" /> : <PlusIcon size={16} />}
                Tambah
              </button>
            </div>
            <textarea
              className="task-input-desc"
              placeholder="Deskripsi (opsional)…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
            />
            <div className="add-extras">
              <div className="extra-field">
                <span className="extra-label">Prioritas</span>
                <select className="extra-select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="high">🔴 Tinggi</option>
                  <option value="medium">🟡 Sedang</option>
                  <option value="low">🟢 Rendah</option>
                </select>
              </div>
              <div className="extra-field">
                <span className="extra-label">Tenggat Waktu</span>
                <input
                  type="date"
                  className="extra-input"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          </div>

          {/* Toolbar: search + sort */}
          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon"><SearchIcon size={15} /></span>
              <input
                className="search-input"
                placeholder="Cari task…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="created_at">Tanggal Dibuat</option>
              <option value="due_date">Tenggat</option>
              <option value="priority">Prioritas</option>
              <option value="title">Judul (A-Z)</option>
              <option value="status">Status</option>
            </select>
            <button className="order-btn" onClick={toggleOrder}>
              {order === "desc" ? "↓ Terbaru" : "↑ Terlama"}
            </button>
          </div>

          {/* Filters */}
          <div className="filter-row">
            {[
              { key: "all",       label: "Semua",      count: total   },
              { key: "pending",   label: "In Progress", count: pending },
              { key: "completed", label: "Selesai",     count: done    },
            ].map(f => (
              <button
                key={f.key}
                className={`filter-btn ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span style={{ opacity: .7 }}>({f.count})</span>
              </button>
            ))}
          </div>

          {/* Task list */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
              <span className="spinner" style={{ borderTopColor: "var(--accent)", borderColor: "var(--border)" }} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <EmptyIcon size={28} color="var(--muted)" />
              </div>
              <div className="empty-title">
                {search ? "Tidak ditemukan" : "Belum ada task"}
              </div>
              <div className="empty-text">
                {search
                  ? `Tidak ada task yang cocok dengan "${search}"`
                  : filter === "all" ? "Tambahkan task pertamamu di atas." : `Tidak ada task ${filter === "pending" ? "in progress" : "selesai"}.`}
              </div>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map(task => {
                const due = task.due_date ? task.due_date.split("T")[0] : null;
                return (
                  <div
                    key={task.id}
                    className={`task-card ${task.status === "completed" ? "done" : ""} priority-${task.priority || "medium"}`}
                  >
                    {/* Toggle check */}
                    <button
                      className={`task-check ${task.status === "completed" ? "checked" : ""}`}
                      onClick={() => toggleTask(task)}
                      title={task.status === "completed" ? "Tandai pending" : "Tandai selesai"}
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
                          {task.status === "completed" ? "Selesai" : "In Progress"}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        {due && <DueBadge due={due} />}
                        {task.created_at && (
                          <span className="task-date">
                            {new Date(task.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button className="btn-icon edit" title="Edit" onClick={() => setEditTask(task)}>
                        <EditIcon size={16} />
                      </button>
                      <button className="btn-icon danger" title="Hapus" onClick={() => deleteTask(task.id)}>
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {editTask && (
        <EditModal task={editTask} onClose={() => setEditTask(null)} onSave={handleEditSave} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,     setUser]     = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
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
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#0f1117",
      }}>
        <GlobalStyles />
        <span className="spinner" style={{ width: 32, height: 32, borderTopColor: "#6366f1", borderColor: "#2e3247" }} />
      </div>
    );
  }

  return user
    ? <MainApp user={user} onLogout={handleLogout} />
    : <AuthPage onLogin={setUser} />;
}
