/* Shared UI building blocks: icons, badges, KPI card, form field, modal frame, table helpers. */
import { useEffect, useRef, useState } from 'react';
import { IC } from './icons';
import { F, PAGESIZE, emit, navigate, closeModal } from '../lib/store';
import { isOverdue } from '../lib/model';

export const stop = fn => e => { e.stopPropagation(); fn(e); };

export function Icon({ name, cls = '' }) {
  return <svg className={`i ${cls}`} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: IC[name] || '' }} />;
}

/* ---------- badges (colour + text, never colour alone) ---------- */
export function Badge({ cls, flat, children, style }) {
  return <span className={`badge ${cls}${flat ? ' flat' : ''}`} style={style}>{children}</span>;
}
const M_CLS = { Operational: 'b-ok', 'Under Maintenance': 'b-info', Breakdown: 'b-crit', Inactive: 'b-off' };
const W_CLS = { Scheduled: 'b-info', 'In Progress': 'b-prog', 'On Hold': 'b-warn', Completed: 'b-ok', Cancelled: 'b-off' };
const P_CLS = { Low: 'b-off', Medium: 'b-info', High: 'b-warn', Critical: 'b-crit' };
const B_CLS = { Reported: 'b-crit', Acknowledged: 'b-warn', 'Under Repair': 'b-prog', Resolved: 'b-ok', Closed: 'b-off' };
export const MBadge = ({ s }) => <Badge cls={M_CLS[s]}>{s}</Badge>;
export const PBadge = ({ p }) => <Badge cls={P_CLS[p]}>{p}</Badge>;
export const BBadge = ({ s }) => <Badge cls={B_CLS[s]}>{s}</Badge>;
export const UBadge = ({ s }) => <Badge cls={s === 'Active' ? 'b-ok' : 'b-off'}>{s}</Badge>;
/* Overdue is an extra warning badge; it never replaces the underlying status. */
export const WBadge = ({ w, noOd }) => (
  <>
    <Badge cls={W_CLS[w.status]}>{w.status}</Badge>
    {!noOd && isOverdue(w) && <>{' '}<Badge cls="solid-crit">Overdue</Badge></>}
  </>
);

/* ---------- cards ---------- */
export function Kpi({ label, val, ico, tone, sub, to }) {
  const inner = (
    <>
      <div className="top"><span>{label}</span><span className={`ico t-${tone}`}><Icon name={ico} /></span></div>
      <div className="val">{val}</div>
      <div className="sub">{sub || ' '}</div>
    </>
  );
  return to
    ? <button type="button" className="card kpi clickable" onClick={() => navigate(to)}>{inner}</button>
    : <div className="card kpi">{inner}</div>;
}
export const EmptyState = ({ title, text }) => <div className="empty"><Icon name="search" cls="lg" /><h4>{title}</h4><p>{text}</p></div>;
export const Dl = ({ k, full, children }) => (
  <div className={full ? 'full' : ''}><div className="k">{k}</div><div className="v">{children || <span className="muted">—</span>}</div></div>
);

/* ---------- forms ---------- */
export function Field({ id, label, error, full, children }) {
  return (
    <div className={`fld${full ? ' full' : ''}${error ? ' err' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      <span className="msg">{error}</span>
    </div>
  );
}
export const Opts = ({ list, all }) => (
  <>
    {all && <option value={all}>{all}</option>}
    {list.map(o => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return <option key={v} value={v}>{l}</option>; })}
  </>
);
/* form state helper: values, setters and required-field validation */
export function useForm(initial) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState({});
  const set = (k, val) => setV(p => ({ ...p, [k]: val }));
  const bind = k => ({ id: k, value: v[k], onChange: e => set(k, e.target.value) });
  const validate = keys => {
    const e = {}; keys.forEach(k => { if (!String(v[k] ?? '').trim()) e[k] = 'This field is required.'; });
    setErr(e); return Object.keys(e).length === 0;
  };
  return { v, set, bind, err, setErr, validate };
}

/* ---------- modal frame ---------- */
export function Modal({ title, small, footer, children }) {
  const ref = useRef(null);
  useEffect(() => { const f = ref.current && ref.current.querySelector('input:not([readonly]),select,textarea'); if (f) f.focus(); }, []);
  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className={`modal${small ? ' sm' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="modal-h"><h3>{title}</h3><button type="button" className="icon-btn" onClick={closeModal} aria-label="Close"><Icon name="x" /></button></div>
        <div className="modal-b">{children}</div>
        <div className="modal-f">{footer}</div>
      </div>
    </div>
  );
}
export const CancelBtn = ({ label = 'Cancel' }) => <button type="button" className="btn" onClick={closeModal}>{label}</button>;

/* ---------- table helpers (sorting + paging driven by the F filter state) ---------- */
export function SortTh({ p, k, children }) {
  const f = F[p], on = f.sort === k;
  const click = () => { if (f.sort === k) f.dir *= -1; else { f.sort = k; f.dir = 1; } emit(); };
  return (
    <th className={`sortable${on ? ' sorted' : ''}`} onClick={click} aria-sort={on ? (f.dir > 0 ? 'ascending' : 'descending') : 'none'}>
      {children}<span className="arr">{on ? (f.dir > 0 ? '▲' : '▼') : '↕'}</span>
    </th>
  );
}
export const sortBy = (rows, p, get = {}) => {
  const f = F[p], g = get[f.sort] || (r => r[f.sort]);
  return rows.slice().sort((a, b) => { const x = g(a), y = g(b); return (x > y ? 1 : x < y ? -1 : 0) * f.dir; });
};
export const pageRows = (rows, p) => rows.slice((F[p].page - 1) * PAGESIZE, F[p].page * PAGESIZE);
export function Pager({ total, p }) {
  const f = F[p], pages = Math.max(1, Math.ceil(total / PAGESIZE));
  if (f.page > pages) f.page = pages;
  const a = total ? (f.page - 1) * PAGESIZE + 1 : 0, b = Math.min(total, f.page * PAGESIZE);
  const go = n => { f.page = n; emit(); };
  return (
    <div className="pager">
      <span>Showing {a}–{b} of {total}</span>
      <div className="pg">
        <button type="button" onClick={() => go(f.page - 1)} disabled={f.page <= 1} aria-label="Previous page">‹</button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => <button type="button" key={n} className={n === f.page ? 'on' : ''} onClick={() => go(n)} aria-label={`Page ${n}`}>{n}</button>)}
        <button type="button" onClick={() => go(f.page + 1)} disabled={f.page >= pages} aria-label="Next page">›</button>
      </div>
    </div>
  );
}
/* simple search + select filter helpers bound to F */
export const setF = (p, k, v) => { F[p][k] = v; F[p].page = 1; emit(); };
