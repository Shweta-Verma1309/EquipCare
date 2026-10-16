/* App root: hash router (#/manager/dashboard), role guard, shell, drawers, modals and toasts. */
import { useEffect, useSyncExternalStore } from 'react';
import AppShell from './layout/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import Machines from './pages/Machines';
import Maintenance from './pages/Maintenance';
import Breakdowns from './pages/Breakdowns';
import Users from './pages/Users';
import DrawerHost from './drawers/Drawers';
import ModalHost from './modals/Modals';
import { S, emit, useStore, navigate, closeModal, closeDrawer } from './lib/store';

const PAGES = {
  manager: {
    dashboard: ['Manager Dashboard', ManagerDashboard], machines: ['Machines', Machines], maintenance: ['Maintenance', Maintenance],
    breakdowns: ['Breakdown', Breakdowns], users: ['User Management', Users]
  },
  engineer: {
    dashboard: ['My Dashboard', EngineerDashboard], machines: ['Machines', Machines], maintenance: ['Maintenance', Maintenance], breakdowns: ['Breakdown', Breakdowns]
  }
};

const subscribeHash = cb => { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb); };
const useRoute = () => useSyncExternalStore(subscribeHash, () => window.location.hash, () => '').replace(/^#\/?/, '');

export default function App() {
  useStore(); /* re-render whenever the simulated data or UI state changes */
  const route = useRoute();
  const [role, page] = route.split('/');
  const mine = S.role === 'Manager' ? 'manager' : S.role === 'Engineer' ? 'engineer' : null;
  const valid = route && route !== 'login' && PAGES[role] && PAGES[role][page];
  const target = !valid || !mine ? (route === '' || route === 'login' ? null : mine ? `${mine}/dashboard` : 'login') : role !== mine ? `${mine}/${page}` : null;

  /* redirect invalid, signed-out or wrong-role routes */
  useEffect(() => { if (target !== null && route !== '' && route !== 'login') navigate(target); }, [target, route]);

  /* reset overlays and scroll position when the route changes */
  useEffect(() => { S.modal = null; S.drawer = null; S.menuOpen = false; S.pop = null; emit(); window.scrollTo(0, 0); }, [route]);

  /* Escape closes the top-most overlay */
  useEffect(() => {
    const h = e => { if (e.key !== 'Escape') return; if (S.modal) closeModal(); else if (S.drawer) closeDrawer(); else if (S.pop) { S.pop = null; emit(); } };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, []);

  let body = null, title = 'EquipCare Maintenance Console';
  if (route === '') body = <Landing />;
  else if (route === 'login') { body = <Login />; title = 'Sign in · EquipCare'; }
  else if (valid && mine && role === mine) {
    const [t, Page] = PAGES[role][page]; title = `${t} · EquipCare Maintenance Console`;
    body = <AppShell role={role} page={page} title={t}><Page /></AppShell>;
  }
  useEffect(() => { document.title = title; }, [title]);

  return (
    <>
      {body}
      <DrawerHost />
      <ModalHost />
      <div className="toast-wrap" aria-live="polite">{S.toasts.map(t => <div key={t.id} className={`toast ${t.kind}`} role="status">{t.msg}</div>)}</div>
    </>
  );
}
