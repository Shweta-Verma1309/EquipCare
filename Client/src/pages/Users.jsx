/* User management (manager only). Simulated: no passwords, no real identity management. */
import { USERS, WOS } from '../data/data';
import { Icon, Opts, Kpi, EmptyState, UBadge, SortTh, Pager, sortBy, pageRows, setF, stop } from '../components/ui';
import { F, openDrawer, openModal } from '../lib/store';
import { initials, fmtDT } from '../lib/model';
import { userToggle } from '../lib/actions';

export default function Users() {
  const f = F.users;
  let rows = USERS.slice();
  if (f.role !== 'All') rows = rows.filter(u => u.role === f.role);
  if (f.status !== 'All') rows = rows.filter(u => u.status === f.status);
  const q = f.q.trim().toLowerCase(); if (q) rows = rows.filter(u => [u.id, u.name, u.email, u.dept].join(' ').toLowerCase().includes(q));
  rows = sortBy(rows, 'users');
  const n = k => USERS.filter(u => u.role === k).length;
  return (
    <>
      <div className="page-h">
        <div><h2>User Management</h2><p>Manage maintenance engineer and manager accounts. Prototype only: no passwords or real identity management.</p></div>
        <button type="button" className="btn primary" onClick={() => openModal('userForm', {})}><Icon name="plus" cls="sm" />Add User</button>
      </div>
      <div className="grid g4">
        <Kpi label="Total Users" val={USERS.length} ico="users" tone="info" />
        <Kpi label="Active Users" val={USERS.filter(u => u.status === 'Active').length} ico="checkc" tone="ok" sub={`${USERS.filter(u => u.status !== 'Active').length} inactive`} />
        <Kpi label="Managers" val={n('Manager')} ico="shield" tone="info" />
        <Kpi label="Maintenance Engineers" val={n('Maintenance Engineer')} ico="wrench" tone="warn" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="fld search"><label className="sr" htmlFor="uq">Search users</label><Icon name="search" cls="sm" /><input className="inp" id="uq" type="search" placeholder="Search name, email, department" value={f.q} onChange={e => setF('users', 'q', e.target.value)} /></div>
          <div className="fld"><label htmlFor="ur">Role</label><select className="inp" id="ur" value={f.role} onChange={e => setF('users', 'role', e.target.value)}><Opts list={['Manager', 'Maintenance Engineer']} all="All" /></select></div>
          <div className="fld"><label htmlFor="us">Account status</label><select className="inp" id="us" value={f.status} onChange={e => setF('users', 'status', e.target.value)}><Opts list={['Active', 'Inactive']} all="All" /></select></div>
        </div>
        {rows.length ? (
          <>
            <div className="tbl-wrap"><table>
              <thead><tr><SortTh p="users" k="id">User ID</SortTh><SortTh p="users" k="name">Full Name</SortTh><SortTh p="users" k="email">Email</SortTh><SortTh p="users" k="role">Role</SortTh><SortTh p="users" k="dept">Department</SortTh><SortTh p="users" k="status">Account Status</SortTh><SortTh p="users" k="last">Last Active</SortTh><th>Actions</th></tr></thead>
              <tbody>{pageRows(rows, 'users').map(u => (
                <tr className="row click" key={u.id} onClick={() => openDrawer('user', u.id)}>
                  <td className="mono">{u.id}</td>
                  <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(u.name)}</span><span className="cell-main">{u.name}</span></div></td>
                  <td>{u.email}</td><td>{u.role}</td><td>{u.dept}</td><td><UBadge s={u.status} /></td><td className="nowrap">{fmtDT(u.last)}</td>
                  <td><div className="actions" style={{ flexWrap: 'nowrap' }}>
                    <button type="button" className="btn sm" onClick={stop(() => openDrawer('user', u.id))}>View</button>
                    <button type="button" className="btn sm" onClick={stop(() => openModal('userForm', { id: u.id }))} aria-label={`Edit ${u.name}`}><Icon name="edit" cls="sm" /></button>
                    <button type="button" className={`btn sm${u.status === 'Active' ? ' danger' : ''}`} onClick={stop(() => userToggle(u.id))}>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                  </div></td>
                </tr>))}</tbody>
            </table></div>
            <Pager total={rows.length} p="users" />
          </>
        ) : <EmptyState title="No users match" text="Try clearing the search or filters." />}
      </div>
    </>
  );
}
