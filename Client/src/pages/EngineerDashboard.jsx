
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';
import { Icon, Badge, Kpi, EmptyState, PBadge, WBadge } from '../components/ui';
import { S, navigate, openDrawer, myNotifs, emit } from '../lib/store';
import { fmtDate, fmtShort, fmtTime, fmtDT } from '../lib/model';
import WoBtn from '../components/WoActions';

function getUser() {
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

function dateOnly(value) {
  return value ? value.slice(0, 10) : '';
}

function isCompleted(workOrder) {
  return ['Completed', 'Closed'].includes(workOrder.status);
}

function isOpen(workOrder) {
  return !isCompleted(workOrder) &&
    !['Cancelled', 'Canceled', 'Skipped'].includes(workOrder.status);
}

function isOverdue(workOrder) {
  return isOpen(workOrder) &&
    workOrder.scheduledEnd &&
    new Date(workOrder.scheduledEnd) < new Date();
}

function priorityRank(priority) {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority] ?? 4;
}

function statusClass(status) {
  if (status === 'Completed' || status === 'Closed') return 'b-ok';
  if (status === 'In Progress') return 'b-info';
  if (status === 'Open' || status === 'Scheduled') return 'b-warn';
  if (status === 'Cancelled' || status === 'Canceled') return 'b-crit';
  return 'b-info';
}

function StatusBadge({ status }) {
  return <Badge cls={statusClass(status)} flat>{status || 'Unknown'}</Badge>;
}

export default function EngineerDashboard() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = getUser();
  const userId = Number(user.userId);
  const today = dateOnly(new Date().toISOString());
  const month = today.slice(0, 7);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkOrders() {
      setLoading(true);
      setError('');

      try {
        const data = await apiRequest('/workorders');

        if (!Array.isArray(data)) {
          throw new Error('The work orders API did not return a list.');
        }

        if (!cancelled) {
          setWorkOrders(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load work orders.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWorkOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  // Filter on the authenticated user's ID.
  const mine = useMemo(
    () => workOrders.filter(w => Number(w.assignedToUserId) === userId),
    [workOrders, userId]
  );

  const open = mine.filter(isOpen);
  const due = open.filter(w => dateOnly(w.scheduledStart) === today);
  const overdue = open.filter(isOverdue);
  const inProgress = mine.filter(w => w.status === 'In Progress');

  const completedThisMonth = mine.filter(
    w => isCompleted(w) &&
      w.actualEnd &&
      dateOnly(w.actualEnd).startsWith(month)
  );

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcoming = open
    .filter(w =>
      w.scheduledStart &&
      dateOnly(w.scheduledStart) > today &&
      new Date(w.scheduledStart) <= nextWeek
    )
    .sort((a, b) =>
      new Date(a.scheduledStart) - new Date(b.scheduledStart)
    );

  const sortedOpen = [...open].sort((a, b) =>
    Number(isOverdue(b)) - Number(isOverdue(a)) ||
    priorityRank(a.priority) - priorityRank(b.priority) ||
    new Date(a.scheduledStart || 0) - new Date(b.scheduledStart || 0)
  );

  const history = mine
    .filter(isCompleted)
    .sort((a, b) =>
      new Date(b.actualEnd || b.scheduledEnd || b.createdAt) -
      new Date(a.actualEnd || a.scheduledEnd || a.createdAt)
    )
    .slice(0, 4);

  const readN = n => {
    n.read = true;
    emit();
    if (n.go) navigate(`engineer/${n.go}`);
  };

  if (loading) {
    return <div className="card">Loading your assigned work orders...</div>;
  }

  return (
    <>
      <div className="page-h">
        <div>
          <h2>Good morning, {(user.fullName || 'Engineer').split(' ')[0]}</h2>
          <p>Your assigned jobs, deadlines and next actions.</p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => navigate('engineer/maintenance')}
          >
            <Icon name="clip" cls="sm" /> All my work orders
          </button>
        </div>
      </div>

      {error && (
        <div className="note t-error" role="alert">
          <Icon name="alert" cls="sm" />
          <span>{error}</span>
          <button
            type="button"
            className="btn sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid g5">
        <Kpi
          label="My Open Work Orders"
          val={open.length}
          ico="clip"
          tone="info"
          sub="All unfinished assigned jobs"
          to="engineer/maintenance"
        />
        <Kpi
          label="Jobs Due Today"
          val={due.length}
          ico="cal"
          tone="warn"
          sub={fmtDate(today)}
          to="engineer/maintenance"
        />
        <Kpi
          label="My Overdue Jobs"
          val={overdue.length}
          ico="clock"
          tone={overdue.length ? 'crit' : 'ok'}
          sub={overdue.length ? 'Past scheduled end time' : 'On track'}
          to="engineer/maintenance"
        />
        <Kpi
          label="In Progress"
          val={inProgress.length}
          ico="wrench"
          tone="info"
          sub="Currently being worked"
        />
        <Kpi
          label="Completed This Month"
          val={completedThisMonth.length}
          ico="checkc"
          tone="ok"
          sub={month}
        />
      </div>

      <div className="card">
        <div className="card-h">
          <h3>My assigned work orders</h3>
          <Badge cls="b-info" flat>{open.length} open</Badge>
        </div>

        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Work Order</th>
                <th>Machine</th>
                <th>Type</th>
                <th>Scheduled</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedOpen.map(w => (
                <tr className="row" key={w.workOrderId}>
                  <td className="mono">{w.workOrderId}</td>
                  <td>
                    <div className="cell-main">{w.machineName || `Machine ${w.machineId}`}</div>
                    <div className="cell-sub mono">{w.machineId}</div>
                  </td>
                  <td>{w.maintenanceType}</td>
                  <td className="nowrap">
                    {w.scheduledStart ? fmtShort(w.scheduledStart) : '—'}
                  </td>
                  <td><PBadge p={w.priority} /></td>
                  <td><StatusBadge status={w.status} /></td>
                  <td>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => openDrawer('wo', w.workOrderId)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {!sortedOpen.length && (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      title="No open work orders"
                      text="You have no unfinished work orders assigned to you."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid g2">
        <div className="card">
          <div className="card-h">
            <h3>Today's maintenance</h3>
            <Badge cls="b-warn" flat>{due.length} today</Badge>
          </div>
          <div className="list">
            {due.length ? due.map(w => (
              <button
                type="button"
                className="li"
                key={w.workOrderId}
                onClick={() => openDrawer('wo', w.workOrderId)}
              >
                <span className="ico t-info mono" style={{ fontSize: 11 }}>
                  {w.scheduledStart ? fmtTime(w.scheduledStart) : '—'}
                </span>
                <span className="body">
                  <span className="tt">{w.machineName}</span>
                  <br />
                  <span className="tx">{w.description || w.title}</span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <PBadge p={w.priority} />
                  <StatusBadge status={w.status} />
                </span>
              </button>
            )) : (
              <EmptyState title="Nothing due today" text="No jobs scheduled for today." />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Upcoming maintenance</h3>
            <span className="muted" style={{ fontSize: 12.5 }}>Next 7 days</span>
          </div>
          <div className="list">
            {upcoming.length ? upcoming.map(w => (
              <button
                type="button"
                className="li"
                key={w.workOrderId}
                onClick={() => openDrawer('wo', w.workOrderId)}
              >
                <span className="ico t-info">
                  {new Date(w.scheduledStart).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="body">
                  <span className="tt">{w.machineName}</span>
                  <br />
                  <span className="tx">
                    {w.maintenanceType} · {fmtTime(w.scheduledStart)}
                  </span>
                </span>
                <PBadge p={w.priority} />
              </button>
            )) : (
              <EmptyState title="Nothing upcoming" text="No further jobs this week." />
            )}
          </div>
        </div>
      </div>

      <div className="grid g2">
        <div className="card">
          <div className="card-h">
            <h3>Notifications</h3>
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => {
                const notifications = myNotifs();
                notifications.forEach(n => { n.read = true; });
                emit();
              }}
            >
              Mark all read
            </button>
          </div>
          <div className="list">
            {myNotifs().slice(0, 5).map(n => (
              <button
                type="button"
                className="li"
                key={n.id}
                onClick={() => readN(n)}
                style={n.read ? undefined : {
                  background: 'color-mix(in srgb,var(--info-bg) 45%,var(--card))',
                }}
              >
                <span className="body">
                  <span className="tt">{n.title}</span>
                  <br />
                  <span className="tx">{n.text}</span>
                  <br />
                  <span className="meta">{n.time}</span>
                </span>
              </button>
            ))}
            {!myNotifs().length && (
              <EmptyState title="No notifications" text="You're all caught up." />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Work summary</h3>
          </div>
          <div className="list">
            <div className="li">
              <span className="body">
                <span className="tt">Total assigned</span>
                <br />
                <span className="tx">{mine.length} work orders</span>
              </span>
            </div>
            <div className="li">
              <span className="body">
                <span className="tt">Completed</span>
                <br />
                <span className="tx">{mine.filter(isCompleted).length} work orders</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Recent maintenance history</h3>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Machine</th>
                <th>Work Order</th>
                <th>Completed</th>
                <th>Work Summary</th>
                <th>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(w => (
                <tr
                  className="row click"
                  key={w.workOrderId}
                  onClick={() => openDrawer('wo', w.workOrderId)}
                >
                  <td>
                    <div className="cell-main">{w.machineName}</div>
                    <div className="cell-sub mono">{w.machineId}</div>
                  </td>
                  <td className="mono">{w.workOrderId}</td>
                  <td className="nowrap">
                    {w.actualEnd ? fmtDT(w.actualEnd) : '—'}
                  </td>
                  <td style={{ minWidth: 240 }}>
                    {w.notes || w.description || w.title}
                  </td>
                  <td><StatusBadge status={w.status} /></td>
                </tr>
              ))}
              {!history.length && (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      title="No completed maintenance yet"
                      text="Completed work orders will appear here."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
