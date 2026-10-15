
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import {
  Icon, Field, Opts, EmptyState, MBadge, SortTh, Pager,
  sortBy, pageRows, setF, stop
} from '../components/ui';
import { S, F, emit, isMgr, openDrawer, openModal } from '../lib/store';
import { uname, fmtDate, TODAY } from '../lib/model';

export const changeDept = (p, v) => {
  if (isMgr()) S.dept = v;
  else F[p].dept = v;
  F[p].page = 1;
  emit();
};

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

function mapMachine(m) {
  return {
    ...m,
    id: String(m.machineId),
    name: m.machineName || '',
    dept: m.departmentName || '',
    cat: m.categoryName || '',
    loc: m.location || '',
    status: m.currentStatus || 'Unknown',
    eng: null,
    assetCode: m.assetCode,
    manufacturer: m.manufacturer,
    modelNumber: m.modelNumber,
    serialNumber: m.serialNumber,
    installationDate: m.installationDate,
    criticality: m.criticality,
    isActive: m.isActive,
  };
}

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(value) {
  const date = asDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
}

function recordDate(record) {
  return record.maintenanceDate || record.performedAt || record.completedAt ||
    record.actualEnd || record.recordDate || record.date || null;
}

function isCompletedOrder(order) {
  const status = String(order.status || '').toLowerCase();
  return ['completed', 'closed', 'cancelled', 'canceled', 'skipped'].includes(status);
}

function enrichMachine(machine, plans, records, orders) {
  const machineId = Number(machine.machineId);
  const machinePlans = plans.filter(p => Number(p.machineId) === machineId && p.isActive);
  const machineRecords = records.filter(r => Number(r.machineId) === machineId);
  const machineOrders = orders.filter(o => Number(o.machineId) === machineId);

  const completedDates = [
    ...machineRecords.map(recordDate),
    ...machineOrders.filter(isCompletedOrder).map(o => o.actualEnd),
  ].map(asDate).filter(Boolean).sort((a, b) => b - a);
  const lastMaintenance = completedDates[0] ? completedDates[0].toISOString() : null;

  const candidates = [
    ...machinePlans.map(p => p.nextDueDate),
    ...machineOrders.filter(o => !isCompletedOrder(o)).map(o => o.scheduledStart),
  ].map(asDate).filter(d => d && dateKey(d) >= TODAY).sort((a, b) => a - b);
  const nextMaintenance = candidates[0] ? candidates[0].toISOString() : null;

  const assignedOrder = machineOrders
    .filter(o => !isCompletedOrder(o) && o.assignedToUserName)
    .sort((a, b) => {
      const da = asDate(a.scheduledStart)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const db = asDate(b.scheduledStart)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return da - db;
    })[0];

  return {
    ...machine,
    lastMaintenance,
    nextMaintenance,
    engineerName: assignedOrder?.assignedToUserName || null,
    eng: assignedOrder?.assignedToUserId ?? null,
  };
}

export default function Machines() {
  const f = F.machines;
  const mgr = isMgr();
  const user = getUser();

  const [apiMachines, setApiMachines] = useState([]);
  const [maintenancePlans, setMaintenancePlans] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const results = await Promise.allSettled([
          apiRequest('/machines'),
          apiRequest('/maintenanceplans'),
          apiRequest('/maintenancerecords'),
          apiRequest('/workorders'),
        ]);

        if (cancelled) return;

        const labels = ['machines', 'maintenance plans', 'maintenance records', 'work orders'];
        const failed = results
          .map((result, index) => result.status === 'rejected' ? `${labels[index]}: ${result.reason?.message || 'request failed'}` : null)
          .filter(Boolean);

        const readList = (result, label) => {
          if (result.status !== 'fulfilled') return [];
          if (!Array.isArray(result.value)) {
            failed.push(`${label}: API did not return a list`);
            return [];
          }
          return result.value;
        };

        const machines = readList(results[0], 'machines');
        const plans = readList(results[1], 'maintenance plans');
        const records = readList(results[2], 'maintenance records');
        const orders = readList(results[3], 'work orders');

        setApiMachines(machines.map(mapMachine));
        setMaintenancePlans(plans);
        setMaintenanceRecords(records);
        setWorkOrders(orders);
        if (results[0].status === 'rejected') {
          setError(failed.join(' | ') || 'Failed to load machines.');
        } else if (failed.length) {
          setError(`Some maintenance details could not be loaded: ${failed.join(' | ')}`);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load machine data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const allMachines = apiMachines.map(machine =>
    enrichMachine(machine, maintenancePlans, maintenanceRecords, workOrders)
  );
  const visibleMachines = allMachines;

  const departments = [
    ...new Set(allMachines.map(m => m.dept).filter(Boolean))
  ].sort();

  const categories = [
    ...new Set(allMachines.map(m => m.cat).filter(Boolean))
  ].sort();

  const departmentFilter = mgr
    ? S.dept
    : f.dept || 'All Departments';

  let rows = visibleMachines.slice();

  if (departmentFilter !== 'All Departments') {
    rows = rows.filter(m => m.dept === departmentFilter);
  }

  if (f.cat !== 'All') {
    rows = rows.filter(m => m.cat === f.cat);
  }

  if (f.status !== 'All') {
    rows = rows.filter(m => m.status === f.status);
  }

  const query = f.q.trim().toLowerCase();

  if (query) {
    rows = rows.filter(m =>
      [m.id, m.name, m.loc, m.cat, m.dept]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  rows = sortBy(rows, 'machines', {
    last: m => m.lastMaintenance || '',
    next: m => m.nextMaintenance || '9999',
    eng: m => m.engineerName || uname(m.eng) || '',
  });

  const allDepartments = [
    'All Departments',
    ...departments
  ];

  if (loading) {
    return <div className="card">Loading machines...</div>;
  }

  return (
    <>
      <div className="page-h">
        <div>
          <h2>Machines</h2>
          <p>
            {mgr
              ? 'Equipment register for all departments. Open a machine for details.'
              : 'Machine information available to maintenance engineers.'}
          </p>
        </div>

        {mgr && (
          <button
            type="button"
            className="btn primary"
            onClick={() => openModal('machineForm', {})}
          >
            <Icon name="plus" cls="sm" /> Add Machine
          </button>
        )}
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

      <div className="card">
        <div className="toolbar">
          <div className="fld search">
            <label className="sr" htmlFor="mq">Search machines</label>
            <Icon name="search" cls="sm" />
            <input
              className="inp"
              id="mq"
              type="search"
              placeholder="Search ID, name, location"
              value={f.q}
              onChange={e => setF('machines', 'q', e.target.value)}
            />
          </div>

          <div className="fld">
            <label htmlFor="md">Department</label>
            <select
              className="inp"
              id="md"
              value={departmentFilter}
              onChange={e => changeDept('machines', e.target.value)}
            >
              <Opts list={allDepartments} />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="mc">Category</label>
            <select
              className="inp"
              id="mc"
              value={f.cat}
              onChange={e => setF('machines', 'cat', e.target.value)}
            >
              <Opts list={categories} all="All" />
            </select>
          </div>

          <div className="fld">
            <label htmlFor="ms">Operational status</label>
            <select
              className="inp"
              id="ms"
              value={f.status}
              onChange={e => setF('machines', 'status', e.target.value)}
            >
              <Opts
                list={[
                  ...new Set(allMachines.map(m => m.status).filter(Boolean))
                ]}
                all="All"
              />
            </select>
          </div>

          {!mgr && (
            <label className="chk" style={{ paddingBottom: 9 }}>
              <input
                type="checkbox"
                id="mall"
                checked={f.all}
                onChange={e => setF('machines', 'all', e.target.checked)}
              />
              Show all machines
            </label>
          )}
        </div>

        {rows.length ? (
          <>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <SortTh p="machines" k="id">Machine ID</SortTh>
                    <SortTh p="machines" k="name">Machine Name</SortTh>
                    <SortTh p="machines" k="dept">Department</SortTh>
                    <SortTh p="machines" k="cat">Category</SortTh>
                    <SortTh p="machines" k="loc">Location</SortTh>
                    <SortTh p="machines" k="status">Status</SortTh>
                    <SortTh p="machines" k="last">Last Maint.</SortTh>
                    <SortTh p="machines" k="next">Next Maint.</SortTh>
                    <SortTh p="machines" k="eng">Engineer</SortTh>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows(rows, 'machines').map(m => {
                    const next = m.nextMaintenance;
                    const late = next && dateKey(next) < TODAY;

                    return (
                      <tr
                        className="row click"
                        key={m.id}
                        onClick={() => openDrawer('machine', m.id)}
                      >
                        <td className="mono">{m.id}</td>
                        <td className="cell-main">{m.name}</td>
                        <td>{m.dept || '—'}</td>
                        <td>{m.cat || '—'}</td>
                        <td>{m.loc || '—'}</td>
                        <td><MBadge s={m.status} /></td>
                        <td className="nowrap">{m.lastMaintenance ? fmtDate(m.lastMaintenance) : '—'}</td>
                        <td>
                          {next ? (
                            <span
                              style={late
                                ? { color: 'var(--crit)', fontWeight: 600 }
                                : undefined}
                            >
                              {fmtDate(next)}{late ? ' (overdue)' : ''}
                            </span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>{m.engineerName || (m.eng == null ? '—' : uname(m.eng))}</td>
                        <td>
                          <div className="actions" style={{ flexWrap: 'nowrap' }}>
                            <button
                              type="button"
                              className="btn sm"
                              onClick={stop(() => openDrawer('machine', m.id))}
                            >
                              View
                            </button>

                            {mgr && (
                              <button
                                type="button"
                                className="btn sm"
                                onClick={stop(() =>
                                  openModal('machineForm', { id: m.id })
                                )}
                                aria-label={`Edit ${m.name}`}
                              >
                                <Icon name="edit" cls="sm" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pager total={rows.length} p="machines" />
          </>
        ) : (
          <EmptyState
            title={error ? 'Machines unavailable' : 'No machines match'}
            text={error
              ? 'Check the API connection and try again.'
              : 'Try clearing the search or changing a filter.'}
          />
        )}
      </div>
    </>
  );
}
