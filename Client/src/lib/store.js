/* Tiny external store. The sample data arrays are mutated in place (simulated backend),
   then emit() tells React to re-render. No real persistence: a reload resets everything. */
import { useSyncExternalStore } from 'react';
import { NOTIFS, ACTIVITY } from '../data/data';
import { nowISO, fmtShort } from './model';

let version = 0;
const listeners = new Set();
export const emit = () => { version++; listeners.forEach(l => l()); };
const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
export const useStore = () => useSyncExternalStore(subscribe, () => version);

/* UI + session state */
export const S = { role: null, dept: 'All Departments', theme: null, notifs: NOTIFS, drawer: null, modal: null, toasts: [], menuOpen: false, pop: null };

/* Table filter state per page */
export const F = {
  machines: { q: '', cat: 'All', status: 'All', dept: 'All Departments', all: false, page: 1, sort: 'id', dir: 1 },
  maint: { q: '', machine: 'All', type: 'All', status: 'All', prio: 'All', eng: 'All', from: '', to: '', dept: 'All Departments', all: false, page: 1, sort: 'sched', dir: 1 },
  bd: { q: '', status: 'All', sev: 'All', dept: 'All Departments', all: false, page: 1, sort: 'reported', dir: -1 },
  users: { q: '', role: 'All', status: 'All', page: 1, sort: 'id', dir: 1 }
};
export const PAGESIZE = 10;
export const isMgr = () => S.role === 'Manager';
export const myNotifs = () => S.notifs[isMgr() ? 'Manager' : 'Engineer'];
export const deptFilter = p => (isMgr() ? S.dept : F[p].dept);

/* routing (hash based: #/manager/dashboard) */
export const navigate = r => {
  S.menuOpen = false; S.pop = null;
  if ((window.location.hash || '').replace(/^#\/?/, '') === r) emit();
  else window.location.hash = '#/' + r;
  window.scrollTo(0, 0);
};

/* overlays */
let tid = 0;
export const toast = (msg, kind = 'ok') => { const id = ++tid; S.toasts = [...S.toasts, { id, msg, kind }]; emit(); setTimeout(() => { S.toasts = S.toasts.filter(t => t.id !== id); emit(); }, 3800); };
export const openModal = (type, props = {}) => { S.modal = { type, props }; emit(); };
export const closeModal = () => { S.modal = null; emit(); };
export const openDrawer = (kind, id) => { S.drawer = { kind, id }; emit(); };
export const closeDrawer = () => { S.drawer = null; emit(); };
export const logAct = (type, text) => { ACTIVITY.unshift({ t: nowISO(), type, text }); };
export const notify = (role, sev, title, text, go) => { S.notifs[role].unshift({ id: 'N' + Math.random().toString(36).slice(2, 6), sev, title, text, time: fmtShort(nowISO()), read: false, go }); };
