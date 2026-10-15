/* Formatting helpers, lookups and derived values (all computed from the sample data). */
import { NOW, MACHINES, USERS, WOS, BDS, ME_ID } from '../data/data';

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const p2 = n => String(n).padStart(2, '0');
export const fmtDate = i => { if (!i) return '—'; const d = new Date(i.length === 10 ? i + 'T00:00' : i); return `${p2(d.getDate())} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
export const fmtTime = i => { const d = new Date(i); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
export const fmtDT = i => (i ? `${fmtDate(i)}, ${fmtTime(i)}` : '—');
export const fmtShort = i => { const d = new Date(i); return `${p2(d.getDate())} ${MON[d.getMonth()]}, ${fmtTime(i)}`; };
export const isoDate = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const addDays = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return isoDate(d); };
export const TODAY = isoDate(NOW);
export const nowISO = () => `${TODAY}T${fmtTime(NOW)}`;
export const hrs = h => { const m = Math.round(h * 60); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${p2(m % 60)}m`; };
export const initials = n => n.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

export const M = id => MACHINES.find(m => m.id === id);
export const U = id => USERS.find(u => u.id === id);
export const W = id => WOS.find(w => w.id === id);
export const B = id => BDS.find(b => b.id === id);
export const me = () => U(ME_ID);
export const uname = id => (U(id) || {}).name || 'Unassigned';
export const wDept = w => M(w.mid).dept;
export const bDept = b => M(b.mid).dept;
export const OPEN = ['Scheduled', 'In Progress', 'On Hold'];
export const isOverdue = w => ['Scheduled', 'On Hold'].includes(w.status) && new Date(w.sched) < NOW;
export const bdActive = b => ['Reported', 'Acknowledged', 'Under Repair'].includes(b.status);
export const bdHours = b => ((b.resolved ? new Date(b.resolved) : NOW) - new Date(b.reported)) / 36e5;
/* Last maintenance changes only when a qualifying work order is Completed. */
export const lastMaint = m => { const d = WOS.filter(w => w.mid === m.id && w.status === 'Completed' && w.end).map(w => w.end).sort(); return d.length ? d[d.length - 1].slice(0, 10) : m.base; };
export const nextMaint = m => { if (m.status === 'Inactive') return null; const o = WOS.filter(w => w.mid === m.id && OPEN.includes(w.status)).map(w => w.sched.slice(0, 10)).sort(); return o.length ? o[0] : addDays(lastMaint(m), m.freq); };
export const mBds = m => BDS.filter(b => b.mid === m.id);
export const mWarn = m => {
  const r = []; if (m.status === 'Breakdown') r.push('Active breakdown'); const n = mBds(m).length;
  if (n >= 3) r.push(`Repeated breakdowns (${n} recorded)`);
  const od = WOS.filter(w => w.mid === m.id && isOverdue(w)); if (od.length) r.push(`Overdue maintenance (${od.map(w => w.id).join(', ')})`);
  if (m.status === 'Inactive') r.push('Machine inactive');
  return r;
};
export const inDept = (dept, d) => dept === 'All Departments' || dept === d;
export const engs = active => USERS.filter(u => u.role === 'Maintenance Engineer' && (!active || u.status === 'Active'));
export const countBy = (arr, keys, f) => keys.map(k => arr.filter(x => f(x) === k).length);
export const sevCls = { crit: 't-crit', warn: 't-warn', info: 't-info', ok: 't-ok' };
export const sevIcon = { crit: 'alert', warn: 'clock', info: 'info', ok: 'checkc' };
export const nextWOId = () => `WO-2610-${String(Math.max(...WOS.map(w => +w.id.split('-')[2])) + 1).padStart(3, '0')}`;
