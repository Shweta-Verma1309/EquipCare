/* Shared application shell: sidebar, header (dept selector, notifications, profile), content area. */
import { useEffect } from 'react';
import { BDS } from '../data/data';
import { Icon, Opts } from '../components/ui';
import { DEPTS } from '../data/data';
import { S, F, emit, navigate, myNotifs, isMgr, openModal } from '../lib/store';
import { bdActive, initials, me, U, sevCls, sevIcon } from '../lib/model';
import { readAll } from '../lib/actions';
import { toast } from '../lib/store';

const NAV = [['dashboard', 'Dashboard', 'dash'], ['machines', 'Machines', 'cog'], ['maintenance', 'Maintenance', 'wrench'], ['breakdowns', 'Breakdown', 'alert'], ['users', 'User Management', 'users']];


function getLoggedInUser() {
  try {
    return JSON.parse(
      localStorage.getItem('emms_user') ||
      sessionStorage.getItem('emms_user') ||
      '{}'
    );
  } catch {
    return {};
  }
}

export default function AppShell({ role, page, title, children }) {
  const mgr = role === 'manager';
  const loggedInUser = getLoggedInUser();
  const prototypeUser = mgr ? U('U-001') : me();

  const roles = Array.isArray(loggedInUser.roles)
  ? loggedInUser.roles
  : [];

const u = {
  ...prototypeUser,
  name: loggedInUser.fullName || prototypeUser.name,
  email: loggedInUser.email || prototypeUser.email,
  dept: prototypeUser.dept,
  role: roles[0] || (mgr ? 'Manager' : 'Engineer'),
};
  const unread = myNotifs().filter(n => !n.read).length, activeBd = BDS.filter(bdActive).length;
  const toggle = p => { S.pop = S.pop === p ? null : p; emit(); };
  const isDark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => { S.theme = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = S.theme; emit(); };

  /* close popovers when clicking elsewhere */
  useEffect(() => {
    const h = e => { if (S.pop && !e.target.closest('.rel')) { S.pop = null; emit(); } };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const onDept = e => { S.dept = e.target.value; F.machines.page = F.maint.page = F.bd.page = 1; emit(); };
  const readN = n => { n.read = true; S.pop = null; emit(); if (n.go) navigate(`${role}/${n.go}`); };
  const signOut = () => {
    localStorage.removeItem('emms_token');
    localStorage.removeItem('emms_user');
    sessionStorage.removeItem('emms_token');
    sessionStorage.removeItem('emms_user');

    S.role = null;
    S.pop = null;
    emit();
    navigate('login');
  };

  return (
    <div className={`app ${mgr ? '' : 'eng'}${S.menuOpen ? ' open' : ''}`}>
      <aside className="side" aria-label="Main navigation">
        <button type="button" className="brand" onClick={() => navigate('')}><span className="mark">EM</span><span><b>EMMS</b><small>Equipment Maintenance</small></span></button>
        <nav className="nav">
          <div className="sec">{mgr ? 'Plant operations' : 'My workspace'}</div>
          {NAV.filter(n => mgr || n[0] !== 'users').map(n => (
            <button type="button" key={n[0]} className={n[0] === page ? 'on' : ''} aria-current={n[0] === page ? 'page' : undefined} onClick={() => navigate(`${role}/${n[0]}`)}>
              <Icon name={n[2]} /><span>{n[1]}</span>
              {n[0] === 'breakdowns' && activeBd > 0 && <span className="cnt" aria-label={`${activeBd} active`}>{activeBd}</span>}
            </button>
          ))}
        </nav>
        <div className="role"><span className="demo">PROTOTYPE VIEW</span><b>{mgr ? 'Manager / Admin' : 'Maintenance Engineer'}</b><span>{mgr ? 'All departments, user admin' : 'Assigned work only'}</span></div>
      </aside>
      {S.menuOpen && <div className="scrim" onClick={() => { S.menuOpen = false; emit(); }} />}
      <div className="main" style={{ minWidth: 0 }}>
        <header className="head">
          <button type="button" className="icon-btn menu-btn" onClick={() => { S.menuOpen = !S.menuOpen; emit(); }} aria-label="Open menu"><Icon name="menu" /></button>
          <div className="ttl"><div className="crumb">EMMS / {mgr ? 'Manager' : 'Engineer'} / {title}</div><h1>{title}</h1></div>
          <div className="tools">
            {mgr
              ? <div className="dept-sel"><span className="lbl">Dept</span><select id="deptSel" aria-label="Department" value={S.dept} onChange={onDept}><Opts list={['All Departments', ...DEPTS]} /></select></div>
              : <span className="dept-chip" title="Your department"><Icon name="factory" cls="sm" />{u.dept}</span>}
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle light or dark theme"><Icon name={S.theme === 'dark' ? 'sun' : 'moon'} /></button>
            <div className="rel">
              <button type="button" className="icon-btn notif-btn" onClick={() => toggle('notif')} aria-label="Notifications" aria-haspopup="true">
                <Icon name="bell" />{unread > 0 && <span className="dot">{unread}</span>}
              </button>
              {S.pop === 'notif' && (
                <div className="pop notif-pop">
                  <div className="card-h" style={{ padding: '12px 16px' }}><h3 style={{ fontSize: 16 }}>Notifications <span className="muted" style={{ fontSize: 13 }}>({unread} unread)</span></h3><button type="button" className="btn sm ghost" onClick={() => readAll(myNotifs())}>Mark all read</button></div>
                  <div style={{ maxHeight: 420, overflow: 'auto' }}>
                    {myNotifs().map(n => (
                      <button type="button" key={n.id} className={`notif-item${n.read ? '' : ' unread'}`} onClick={() => readN(n)}>
                        <span className={`ico ${sevCls[n.sev]}`} style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={sevIcon[n.sev]} cls="sm" /></span>
                        <span><span className="tt">{n.title} {!n.read && <span className="badge b-info flat" style={{ fontSize: 10.5, padding: '0 6px' }}>New</span>}</span><span className="tx" style={{ display: 'block' }}>{n.text}</span><span className="tm" style={{ display: 'block' }}>{n.time}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="rel">
              <button type="button" className="who" onClick={() => toggle('prof')} aria-haspopup="true">
                <span className="avatar">{initials(u.name)}</span>
                <span className="tx2"><span className="nm">{u.name}</span><span className="rl">
  {u.role === 'Engineer' ? 'Maintenance Engineer' : u.role}
</span></span>
              </button>
              {S.pop === 'prof' && (
                <div className="pop menu-pop">
                  <div className="m-h"><b>{u.name}</b><div className="muted" style={{ fontSize: 12.5 }}>{u.email}</div><div className="muted" style={{ fontSize: 12.5 }}>{mgr ? 'Manager / Admin · All Departments' : `Maintenance Engineer · ${u.dept}`}</div></div>
                  <button type="button" onClick={() => { S.pop = null; openModal('profile'); }}><Icon name="user" cls="sm" />View profile</button>
                  <button type="button" onClick={signOut}><Icon name="logout" cls="sm" />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
