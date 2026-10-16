
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import {
  Icon, Opts, Kpi, EmptyState, UBadge, SortTh, Pager,
  sortBy, pageRows, setF, stop
} from '../components/ui';
import { F, openDrawer, openModal } from '../lib/store';
import { initials, fmtDT } from '../lib/model';
import { userToggle } from '../lib/actions';

export default function Users() {
  const f = F.users;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/users');

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from the users API.');
      }

      setUsers(data.map(u => ({
  id: String(u.userId),
  userId: u.userId,
  name: u.fullName || '',
  email: u.email || '',
  role: u.role || u.roles?.[0] || 'Not provided',
  dept: u.department || u.dept || 'Not provided',
  isActive: Boolean(u.isActive),
  status: u.isActive ? 'Active' : 'Inactive',
  last: u.createdAt,
  employeeCode: u.employeeCode || '',
})));
    } catch (err) {
      setError(err.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    const handleRefresh = () => loadUsers();
    window.addEventListener('emms:users-refresh', handleRefresh);

    return () => {
      window.removeEventListener('emms:users-refresh', handleRefresh);
    };
  }, []);

  let rows = users.slice();

  if (f.role !== 'All') {
    rows = rows.filter(u => u.role === f.role);
  }

  if (f.status !== 'All') {
    rows = rows.filter(u => u.status === f.status);
  }

  const q = f.q.trim().toLowerCase();

  if (q) {
    rows = rows.filter(u =>
      [u.id, u.name, u.email, u.dept, u.employeeCode]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  rows = sortBy(rows, 'users');

  const countRole = role =>
    users.filter(u => u.role === role).length;

  const activeCount =
    users.filter(u => u.status === 'Active').length;

  const handleToggle = async user => {
  const success = await userToggle(user.userId, user.isActive);

  if (success) {
    await loadUsers();
  }
};

  return (
    <>
      <div className="page-h">
        <div>
          <h2>User Management</h2>
          <p>View and manage user accounts.</p>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={() => openModal('userForm', {})}
        >
          <Icon name="plus" cls="sm" />
          Add User
        </button>
      </div>

      <div className="grid g4">
        <Kpi
          label="Total Users"
          val={users.length}
          ico="users"
          tone="info"
        />

        <Kpi
          label="Active Users"
          val={activeCount}
          ico="checkc"
          tone="ok"
          sub={`${users.length - activeCount} inactive`}
        />

        <Kpi
          label="Managers"
          val={countRole('Manager')}
          ico="shield"
          tone="info"
        />

        <Kpi
          label="Maintenance Engineers"
          val={countRole('Maintenance Engineer')}
          ico="wrench"
          tone="warn"
        />
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="fld search">
            <label className="sr" htmlFor="uq">Search users</label>
            <Icon name="search" cls="sm" />
            <input
              className="inp"
              id="uq"
              type="search"
              placeholder="Search name, email, department"
              value={f.q}
              onChange={e => setF('users', 'q', e.target.value)}
            />
          </div>

          <div className="fld">
            <label htmlFor="ur">Role</label>
            <select
              className="inp"
              id="ur"
              value={f.role}
              onChange={e => setF('users', 'role', e.target.value)}
            >
              <Opts
                list={['Manager', 'Maintenance Engineer']}
                all="All"
              />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="us">Account status</label>
            <select
              className="inp"
              id="us"
              value={f.status}
              onChange={e => setF('users', 'status', e.target.value)}
            >
              <Opts
                list={['Active', 'Inactive']}
                all="All"
              />
            </select>
          </div>
        </div>

        {loading && <p className="muted">Loading users...</p>}

        {!loading && error && (
          <div role="alert" className="empty">
            <p>{error}</p>
            <button
              type="button"
              className="btn"
              onClick={loadUsers}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <SortTh p="users" k="id">User ID</SortTh>
                    <SortTh p="users" k="name">Full Name</SortTh>
                    <SortTh p="users" k="email">Email</SortTh>
                    <SortTh p="users" k="role">Role</SortTh>
                    <SortTh p="users" k="dept">Department</SortTh>
                    <SortTh p="users" k="status">Account Status</SortTh>
                    <SortTh p="users" k="last">Created At</SortTh>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows(rows, 'users').map(u => (
                    <tr
                      className="row click"
                      key={u.userId}
                      onClick={() => openDrawer('user', u.userId)}
                    >
                      <td className="mono">{u.id}</td>

                      <td>
                        <div style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center'
                        }}>
                          <span
                            className="avatar"
                            style={{ width: 30, height: 30, fontSize: 11 }}
                          >
                            {initials(u.name)}
                          </span>
                          <span className="cell-main">{u.name}</span>
                        </div>
                      </td>

                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.dept}</td>
                      <td><UBadge s={u.status} /></td>
                      <td className="nowrap">{fmtDT(u.last)}</td>

                      <td>
                        <div
                          className="actions"
                          style={{ flexWrap: 'nowrap' }}
                        >
                          <button
                            type="button"
                            className="btn sm"
                            onClick={stop(() =>
                              openDrawer('user', u.userId)
                            )}
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="btn sm"
                            onClick={stop(() =>
                              openModal('userForm', { id: u.userId })
                            )}
                            aria-label={`Edit ${u.name}`}
                          >
                            <Icon name="edit" cls="sm" />
                          </button>

                          <button
  type="button"
  className={`btn sm ${u.isActive ? 'danger' : 'primary'}`}
  disabled={loading}
  onClick={stop(() => handleToggle(u))}
>
  {u.isActive ? 'Deactivate' : 'Reactivate'}
</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pager total={rows.length} p="users" />
          </>
        )}

        {!loading && !error && rows.length === 0 && (
          <EmptyState
            title="No users match"
            text="Try clearing the search or filters."
          />
        )}
      </div>
    </>
  );
}
