
/* Maintenance management: live work orders, filters and table. */
import { useEffect, useMemo, useState } from 'react';
import { useSyncExternalStore } from 'react';
import {
  DEPTS,
  MTYPES,
  WSTAT,
  PRIO,
  ME_ID
} from '../data/data';
import {
  Icon,
  Opts,
  Kpi,
  EmptyState,
  PBadge,
  WBadge,
  SortTh,
  Pager,
  sortBy,
  pageRows,
  setF,
  stop
} from '../components/ui';
import WoBtn from '../components/WoActions';
import {
  S,
  F,
  emit,
  useStore,
  isMgr,
  deptFilter,
  openDrawer,
  openModal
} from '../lib/store';
import { changeDept } from './Machines';
import { apiRequest } from '../lib/api';

const asArray = value => Array.isArray(value) ? value : [];

const formatDateTime = value => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString();
};

const formatDate = value => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString();
};

const isCompleted = status => status === 'Completed';

const isOverdueOrder = order => {
  if (!order.scheduledEnd && !order.scheduledStart) return false;

  const due = new Date(order.scheduledEnd || order.scheduledStart);

  return (
    !Number.isNaN(due.getTime()) &&
    due < new Date() &&
    !['Completed', 'Cancelled'].includes(order.status)
  );
};

export default function Maintenance() {
  useStore(); // subscribe to store changes
  const f = F.maint;
  const mgr = isMgr();

  const [machines, setMachines] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setError('');

      try {
        const [machineResponse, workOrderResponse] = await Promise.all([
          apiRequest('/machines'),
          apiRequest('/workorders'),
        ]);

        if (cancelled) return;

        setMachines(asArray(machineResponse));
        setWorkOrders(asArray(workOrderResponse));
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load work orders.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    window.addEventListener('emms:refresh', loadData);

    return () => {
      cancelled = true;
      window.removeEventListener('emms:refresh', loadData);
    }; 
  }, []);


  const machineMap = useMemo(
    () => new Map(
      machines.map(machine => [
        String(machine.machineId),
        machine
      ])
    ),
    [machines]
  );

  const getMachine = id => machineMap.get(String(id));

  const getMachineName = order =>
    order.machineName ||
    getMachine(order.machineId)?.machineName ||
    `Machine ${order.machineId}`;

  const getDepartment = order =>
    order.departmentName ||
    getMachine(order.machineId)?.departmentName ||
    'Unassigned';

  const getEngineer = order =>
    order.assignedToUserName || 'Unassigned';

  const getPriority = order => order.priority || 'Medium';

  const getScheduled = order =>
    order.scheduledStart || order.scheduledEnd || '';

  const getId = order => order.workOrderId;

  const base = useMemo(() => {
    let result = workOrders.slice();

    if (!mgr && !f.all) {
      const user = JSON.parse(
        localStorage.getItem('emms_user') ||
        sessionStorage.getItem('emms_user') ||
        '{}'
      );

      const userId = user.userId ?? user.id;

      result = result.filter(
        order =>
          String(order.assignedToUserId) === String(userId)
      );
    }

    const selectedDepartment = deptFilter('maint');

    if (selectedDepartment !== 'All Departments') {
      result = result.filter(
        order => getDepartment(order) === selectedDepartment
      );
    }

    return result;
  }, [workOrders, machines, mgr, f.all, f.dept, S.dept]);

  const rows = useMemo(() => {
    let result = base.slice();

    if (f.machine !== 'All') {
      result = result.filter(
        order => String(order.machineId) === String(f.machine)
      );
    }

    if (f.type !== 'All') {
      result = result.filter(
        order => order.maintenanceType === f.type
      );
    }

    if (f.status !== 'All') {
      result = result.filter(order =>
        f.status === 'Overdue'
          ? isOverdueOrder(order)
          : order.status === f.status
      );
    }

    if (f.prio !== 'All') {
      result = result.filter(
        order => order.priority === f.prio
      );
    }

    if (f.eng !== 'All') {
      result = result.filter(
        order => String(order.assignedToUserId) === String(f.eng)
      );
    }

    if (f.from) {
      result = result.filter(
        order => getScheduled(order).slice(0, 10) >= f.from
      );
    }

    if (f.to) {
      result = result.filter(
        order => getScheduled(order).slice(0, 10) <= f.to
      );
    }

    const query = f.q.trim().toLowerCase();

    if (query) {
      result = result.filter(order =>
        [
          order.workOrderId,
          order.machineId,
          getMachineName(order),
          order.maintenanceType,
          order.title,
          order.description,
          getEngineer(order)
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }

    return sortBy(result, 'maint', {
      id: order => order.workOrderId,
      mid: order => order.machineId,
      mname: getMachineName,
      dept: getDepartment,
      type: order => order.maintenanceType,
      sched: getScheduled,
      eng: getEngineer,
      priority: order => PRIO.indexOf(order.priority),
      status: order => order.status
    });
  }, [
    base,
    f.q,
    f.machine,
    f.type,
    f.status,
    f.prio,
    f.eng,
    f.from,
    f.to,
    f.sort,
    f.dir
  ]);

  const countStatus = status =>
    base.filter(order => order.status === status).length;

  const clear = () => {
    Object.assign(f, {
      q: '',
      machine: 'All',
      type: 'All',
      status: 'All',
      prio: 'All',
      eng: 'All',
      from: '',
      to: '',
      dept: 'All Departments',
      page: 1
    });

    if (mgr) S.dept = 'All Departments';

    emit();
  };

  const actions = order => {
    const id = order.workOrderId;

    if (mgr) {
      return (
        <div className="actions" style={{ flexWrap: 'nowrap' }}>
          <button
            type="button"
            className="btn sm"
            onClick={stop(() => openDrawer('wo', id))}
          >
            View Details
          </button>

          {!['Completed', 'Cancelled'].includes(order.status) && (
            <button
              type="button"
              className="btn sm"
              onClick={stop(() =>
                openModal('woReassign', { id })
              )}
              aria-label={`Reassign ${id}`}
            >
              <Icon name="swap" cls="sm" />
            </button>
          )}
        </div>
      );
    }

    const user = JSON.parse(
      localStorage.getItem('emms_user') ||
      sessionStorage.getItem('emms_user') ||
      '{}'
    );

    const own =
      String(order.assignedToUserId) ===
      String(user.userId ?? user.id);

    return own
    ? <WoBtn w={order} />
    : (
      <button
        type="button"
        className="btn sm"
        onClick={stop(() => openDrawer('wo', id))}
      >
        View Details
      </button>
    );
  };

  if (loading) {
    return (
      <div className="page-h">
        <div>
          <h2>Maintenance Management</h2>
          <p>Loading work orders from the API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-h">
        <div>
          <h2>Maintenance Management</h2>
          <p className="note t-error">{error}</p>
          <button
            type="button"
            className="btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-h">
        <div>
          <h2>Maintenance Management</h2>
          <p>
            {mgr
              ? 'Schedule, assign and track work orders across the plant.'
              : 'Your assigned work orders. Tick "Show all work orders" to browse the rest read-only.'}
          </p>
        </div>

        {mgr && (
          <button
            type="button"
            className="btn primary"
            onClick={() => openModal('schedule', {})}
          >
            <Icon name="plus" cls="sm" />
            Schedule Maintenance
          </button>
        )}
      </div>

      <div className="grid g5">
        <Kpi
          label="Total Work Orders"
          val={base.length}
          ico="clip"
          tone="info"
        />
        <Kpi
          label="Scheduled"
          val={countStatus('Scheduled') + countStatus('Open')}
          ico="cal"
          tone="info"
        />
        <Kpi
          label="In Progress"
          val={countStatus('In Progress')}
          ico="wrench"
          tone="warn"
        />
        <Kpi
          label="Completed"
          val={countStatus('Completed')}
          ico="checkc"
          tone="ok"
        />
        <Kpi
          label="Overdue"
          val={base.filter(isOverdueOrder).length}
          ico="clock"
          tone="crit"
          sub="Past scheduled date and unfinished"
        />
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="fld search">
            <label className="sr" htmlFor="wq">
              Search work orders
            </label>
            <Icon name="search" cls="sm" />
            <input
              className="inp"
              id="wq"
              type="search"
              placeholder="Search work order, machine, engineer"
              value={f.q}
              onChange={e => setF('maint', 'q', e.target.value)}
            />
          </div>

          <div className="fld">
            <label htmlFor="wd">Department</label>
            <select
              className="inp"
              id="wd"
              value={deptFilter('maint')}
              onChange={e => changeDept('maint', e.target.value)}
            >
              <Opts list={['All Departments', ...DEPTS]} />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="wm">Machine</label>
            <select
              className="inp"
              id="wm"
              value={f.machine}
              onChange={e => setF('maint', 'machine', e.target.value)}
            >
              <Opts
                list={machines.map(machine => [
                  String(machine.machineId),
                  `${machine.assetCode} · ${machine.machineName}`
                ])}
                all="All"
              />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="wt">Maintenance type</label>
            <select
              className="inp"
              id="wt"
              value={f.type}
              onChange={e => setF('maint', 'type', e.target.value)}
            >
              <Opts list={MTYPES} all="All" />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="ws">Status</label>
            <select
              className="inp"
              id="ws"
              value={f.status}
              onChange={e => setF('maint', 'status', e.target.value)}
            >
              <Opts list={[...WSTAT, 'Overdue']} all="All" />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="wp">Priority</label>
            <select
              className="inp"
              id="wp"
              value={f.prio}
              onChange={e => setF('maint', 'prio', e.target.value)}
            >
              <Opts list={PRIO} all="All" />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="we">Assigned engineer</label>
            <select
              className="inp"
              id="we"
              value={f.eng}
              onChange={e => setF('maint', 'eng', e.target.value)}
            >
              <Opts
                list={[
                  ...new Map(
                    workOrders
                      .filter(order => order.assignedToUserId != null)
                      .map(order => [
                        String(order.assignedToUserId),
                        [
                          String(order.assignedToUserId),
                          order.assignedToUserName || `User ${order.assignedToUserId}`
                        ]
                      ])
                  ).values()
                ]}
                all="All"
              />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="wf">From date</label>
            <input
              className="inp"
              id="wf"
              type="date"
              value={f.from}
              onChange={e => setF('maint', 'from', e.target.value)}
            />
          </div>

          <div className="fld">
            <label htmlFor="wto">To date</label>
            <input
              className="inp"
              id="wto"
              type="date"
              value={f.to}
              onChange={e => setF('maint', 'to', e.target.value)}
            />
          </div>

          {!mgr && (
            <label className="chk" style={{ paddingBottom: 9 }}>
              <input
                type="checkbox"
                id="wall"
                checked={f.all}
                onChange={e => setF('maint', 'all', e.target.checked)}
              />
              Show all work orders
            </label>
          )}

          <button
            type="button"
            className="btn ghost"
            onClick={clear}
          >
            Clear filters
          </button>
        </div>

        {rows.length ? (
          <>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <SortTh p="maint" k="id">Work Order</SortTh>
                    <SortTh p="maint" k="mid">Machine ID</SortTh>
                    <SortTh p="maint" k="mname">Machine Name</SortTh>
                    <SortTh p="maint" k="dept">Department</SortTh>
                    <SortTh p="maint" k="type">Type</SortTh>
                    <SortTh p="maint" k="sched">Scheduled</SortTh>
                    <SortTh p="maint" k="eng">Engineer</SortTh>
                    <SortTh p="maint" k="priority">Priority</SortTh>
                    <SortTh p="maint" k="status">Status</SortTh>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows(rows, 'maint').map(order => (
                    <tr
                      className="row click"
                      key={order.workOrderId}
                      onClick={() => openDrawer('wo', order.workOrderId)}
                    >
                      <td className="mono">{order.workOrderId}</td>
                      <td className="mono">{order.machineId}</td>
                      <td className="cell-main">{getMachineName(order)}</td>
                      <td>{getDepartment(order)}</td>
                      <td>{order.maintenanceType}</td>
                      <td className="nowrap">
                        {formatDateTime(order.scheduledStart)}
                      </td>
                      <td>{getEngineer(order)}</td>
                      <td><PBadge p={getPriority(order)} /></td>
                      <td>
                        <WBadge
                          w={{
                            status: order.status,
                            sched: order.scheduledStart,
                            end: order.actualEnd,
                            priority: order.priority
                          }}
                          noOd
                        />
                      </td>
                      <td>{actions(order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pager total={rows.length} p="maint" />
          </>
        ) : (
          <EmptyState
            title="No work orders match"
            text="Try clearing the search or widening the date range."
          />
        )}
      </div>
    </>
  );
}
