/* Side drawers: machine, work order, breakdown and user details with role-aware actions. */
import { WOS, MACHINES, ME_ID } from '../data/data';
import { Icon, Badge, Dl, EmptyState, MBadge, PBadge, WBadge, BBadge, UBadge } from '../components/ui';
import { S, isMgr, closeDrawer, openDrawer, openModal } from '../lib/store';
import { M, U, W, B, uname, wDept, isOverdue, bdActive, bdHours, hrs, OPEN, lastMaint, nextMaint, mBds, mWarn, fmtDate, fmtDT, fmtShort } from '../lib/model';
import { BSTAT } from '../data/data';
import { woStart, woResume, woRelease, bdStart, bdReady, userToggle } from '../lib/actions';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

const link = { padding: 0, color: 'var(--link)' };
const MLink = ({ id }) => <button type="button" className="btn sm ghost" style={link} onClick={() => openDrawer('machine', id)}>{M(id).name} <span className="mono">{id}</span></button>;
const Ico = ({ n }) => <Icon name={n} cls="sm" />;
const Btn = ({ onClick, cls = '', ico, children }) => <button type="button" className={`btn ${cls}`} onClick={onClick}>{ico && <Ico n={ico} />}{children}</button>;
const Note = ({ tone, ico, children }) => <div className={`note ${tone}`}><Ico n={ico} /><span>{children}</span></div>;

function Frame({ code, title, badges, children }) {
  return (
    <div className="drawer-ov" onMouseDown={e => { if (e.target === e.currentTarget) closeDrawer(); }}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-h">
          <div><div className="mono muted">{code}</div><h3>{title}</h3><div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{badges}</div></div>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="drawer-b">{children}</div>
      </div>
    </div>
  );
}

/* ---------- machine ---------- */

function MachineDrawer({ id }) {
  const mgr = isMgr();

  const [machine, setMachine] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [plans, setPlans] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMachineDetails() {
      setLoading(true);
      setError('');
      setMachine(null);
      setWorkOrders([]);
      setPlans([]);
      setRecords([]);

      try {
        const [
          machinesData,
          workOrdersData,
          plansData,
          recordsData
        ] = await Promise.all([
          apiRequest('/machines'),
          apiRequest('/workorders'),
          apiRequest('/maintenanceplans'),
          apiRequest('/maintenancerecords')
        ]);

        if (cancelled) return;

        const asArray = data => Array.isArray(data) ? data : [];

        const machines = asArray(machinesData);
        const orders = asArray(workOrdersData);
        const maintenancePlans = asArray(plansData);
        const maintenanceRecords = asArray(recordsData);

        const found = machines.find(
          item => String(item.machineId) === String(id)
        );

        if (!found) {
          throw new Error('Machine not found in the API response.');
        }

        setMachine(found);

        setWorkOrders(
          orders.filter(
            item => String(item.machineId) === String(id)
          )
        );

        setPlans(
          maintenancePlans.filter(
            item =>
              String(item.machineId) === String(id) &&
              item.isActive === true
          )
        );

        setRecords(
          maintenanceRecords.filter(
            item => String(item.machineId) === String(id)
          )
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Could not load machine details.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMachineDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const date = value => {
    if (!value) return '—';

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
      ? '—'
      : parsed.toLocaleDateString();
  };

  const dateTime = value => {
    if (!value) return '—';

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
      ? '—'
      : parsed.toLocaleString();
  };

  const activeOrders = workOrders.filter(
    w => !['Completed', 'Cancelled'].includes(w.status)
  );

  const completedOrders = workOrders
    .filter(w => w.status === 'Completed')
    .sort(
      (a, b) =>
        new Date(b.actualEnd || 0) -
        new Date(a.actualEnd || 0)
    );

  
  const recordDate = record => {
    if (!record || typeof record !== 'object') return null;

    return (
      record.performedAt ||
      record.maintenanceDate ||
      record.completedAt ||
      record.createdAt ||
      null
    );
  };


    
  const lastRecord = records
    .filter(record => record && recordDate(record))
    .sort(
      (a, b) =>
        new Date(recordDate(b)).getTime() -
        new Date(recordDate(a)).getTime()
    )[0];

  const lastMaintenance =
    recordDate(lastRecord) ||
    completedOrders[0]?.actualEnd ||
    null;


  const futureDates = [
    ...activeOrders.map(w => w.scheduledStart),
    ...plans.map(p => p.nextDueDate)
  ]
    .filter(Boolean)
    .map(value => new Date(value))
    .filter(
      value =>
        !Number.isNaN(value.getTime()) &&
        value >= new Date()
    )
    .sort((a, b) => a - b);

  const nextDue = futureDates[0] || null;

  const assignedEngineers = [
    ...new Set(
      activeOrders
        .map(w => w.assignedToUserName)
        .filter(Boolean)
    )
  ];

  if (loading) {
    return (
      <Frame
        code={String(id)}
        title="Loading machine..."
        badges={null}
      >
        <p className="muted">
          Fetching the latest machine details...
        </p>
      </Frame>
    );
  }

  if (error || !machine) {
    return (
      <Frame
        code={String(id)}
        title="Machine details"
        badges={null}
      >
        <Note tone="t-warn" ico="alert">
          {error || 'Machine details are unavailable.'}
        </Note>
        <Btn onClick={closeDrawer}>Close</Btn>
      </Frame>
    );
  }

  return (
    <Frame
      code={machine.assetCode}
      title={machine.machineName}
      badges={
        <>
          <MBadge s={machine.currentStatus} />
          <Badge cls="b-off" flat>
            {machine.departmentName}
          </Badge>
        </>
      }
    >
      <div className="actions">
        {mgr ? (
          <>
            <Btn
              ico="edit"
              onClick={() =>
                openModal('machineForm', { id })
              }
            >
              Edit Machine
            </Btn>

            <Btn
              cls="primary"
              ico="plus"
              onClick={() => {
                closeDrawer();
                openModal('schedule', { mid: id });
              }}
            >
              Schedule Maintenance
            </Btn>
          </>
        ) : (
          <span className="ro">
            <Ico n="lock" /> Read-only for engineers
          </span>
        )}
      </div>

      <div className="card">
        <div className="card-b">
          <div className="sec-t">
            <Ico n="info" /> General information
          </div>

          <div className="dl">
            <Dl k="Asset code">{machine.assetCode}</Dl>
            <Dl k="Machine ID">{machine.machineId}</Dl>
            <Dl k="Machine name">{machine.machineName}</Dl>
            <Dl k="Department">{machine.departmentName}</Dl>
            <Dl k="Category">{machine.categoryName}</Dl>
            <Dl k="Location">{machine.location}</Dl>
            <Dl k="Manufacturer">{machine.manufacturer}</Dl>
            <Dl k="Model number">{machine.modelNumber}</Dl>
            <Dl k="Serial number">{machine.serialNumber}</Dl>
            <Dl k="Installation date">
              {date(machine.installationDate)}
            </Dl>
            <Dl k="Criticality">{machine.criticality}</Dl>
            <Dl k="Operational status">
              <MBadge s={machine.currentStatus} />
            </Dl>
            <Dl k="Active">
              {machine.isActive ? 'Yes' : 'No'}
            </Dl>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-b">
          <div className="sec-t">
            <Ico n="cal" /> Maintenance information
          </div>

          <div className="dl">
            <Dl k="Last maintenance">
              {date(lastMaintenance)}
            </Dl>
            <Dl k="Next scheduled">
              {date(nextDue)}
            </Dl>
            <Dl k="Active work orders">
              {activeOrders.length}
            </Dl>
            <Dl k="Active maintenance plans">
              {plans.length}
            </Dl>
            <Dl k="Assigned engineer" full>
              {assignedEngineers.length
                ? assignedEngineers.join(', ')
                : 'No active work-order assignment'}
            </Dl>
          </div>

          <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
            Details are loaded from the API when this drawer opens.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Work orders</h3>
        </div>

        {workOrders.length ? (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Work order</th>
                  <th>Type</th>
                  <th>Scheduled</th>
                  <th>Engineer</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {workOrders.map(w => (
                  <tr key={w.workOrderId}>
                    <td className="mono">
                      WO-{w.workOrderId}
                    </td>
                    <td>{w.maintenanceType}</td>
                    <td>{dateTime(w.scheduledStart)}</td>
                    <td>{w.assignedToUserName || '—'}</td>
                    <td>{w.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No work orders"
            text="No work orders were found for this machine."
          />
        )}
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Maintenance plans</h3>
        </div>

        {plans.length ? (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Frequency</th>
                  <th>Next due</th>
                </tr>
              </thead>

              <tbody>
                {plans.map(p => (
                  <tr key={p.maintenancePlanId}>
                    <td>{p.planName}</td>
                    <td>{p.maintenanceType}</td>
                    <td>
                      Every {p.frequencyInterval} {p.frequencyUnit}
                    </td>
                    <td>{date(p.nextDueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No active maintenance plans"
            text="No active plans were found for this machine."
          />
        )}
      </div>
    </Frame>
  );
}


/* ---------- work order ---------- */

function WoDrawer({ id }) {
  const mgr = isMgr();

  const [workOrder, setWorkOrder] = useState(null);
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setError('');
      setWorkOrder(null);
      setMachine(null);

      try {
        const order = await apiRequest(`/workorders/${id}`);

        if (cancelled) return;

        setWorkOrder(order);

        if (order.machineId != null) {
          try {
            const machineData = await apiRequest(
              `/machines/${order.machineId}`
            );

            if (!cancelled) setMachine(machineData);
          } catch {
            // Machine details are optional; the work order can still display.
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || 'Could not load work-order details.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const dateTime = value => {
    if (!value) return '—';

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
      ? '—'
      : parsed.toLocaleString();
  };

  if (loading) {
    return (
      <Frame
        code={`WO-${id}`}
        title="Loading work order..."
        badges={null}
      >
        <p className="muted">
          Fetching the latest work-order details...
        </p>
      </Frame>
    );
  }

  if (error || !workOrder) {
    return (
      <Frame
        code={`WO-${id}`}
        title="Work order details"
        badges={null}
      >
        <Note tone="t-warn" ico="alert">
          {error || 'Work order not found.'}
        </Note>
        <Btn onClick={closeDrawer}>Close</Btn>
      </Frame>
    );
  }

  const status = workOrder.status || 'Unknown';
  const priority = workOrder.priority || 'Medium';
  const machineName =
    workOrder.machineName ||
    machine?.machineName ||
    `Machine ${workOrder.machineId}`;

  const department =
    machine?.departmentName ||
    '—';

  return (
    <Frame
      code={`WO-${workOrder.workOrderId}`}
      title={workOrder.title || machineName}
      badges={
        <>
          <WBadge
            w={{
              status,
              scheduledEnd: workOrder.scheduledEnd,
              scheduledStart: workOrder.scheduledStart
            }}
          />
          <PBadge p={priority} />
          <Badge cls="b-off" flat>
            {workOrder.maintenanceType || 'Maintenance'}
          </Badge>
        </>
      }
    >
      
<div className="actions">
  {mgr ? (
    <Btn
      ico="edit"
      onClick={() =>
        openModal('woEdit', {
          id: workOrder.workOrderId,
          workOrder
        })
      }
    >
      Edit Work Order
    </Btn>
  ) : (
    <>
      {String(
        workOrder.assignedToUserId
      ) === String(
        JSON.parse(
          localStorage.getItem('emms_user') ||
          sessionStorage.getItem('emms_user') ||
          '{}'
        ).userId ??
        JSON.parse(
          localStorage.getItem('emms_user') ||
          sessionStorage.getItem('emms_user') ||
          '{}'
        ).id
      ) && workOrder.status === 'In Progress' ? (
        <Btn
          ico="check"
          onClick={() =>
            openModal('woComplete', {
              id: workOrder.workOrderId
            })
          }
        >
          Complete Work
        </Btn>
      ) : (
        <span className="ro">
          <Ico n="lock" /> Work-order actions depend on your assignment.
        </span>
      )}
    </>
  )}
</div>


      <div className="card">
        <div className="card-b">
          <div className="sec-t">
            <Ico n="clip" /> Work-order information
          </div>

          <div className="dl">
            <Dl k="Work order ID">
              <span className="mono">
                {workOrder.workOrderId}
              </span>
            </Dl>

            <Dl k="Title">{workOrder.title}</Dl>
            <Dl k="Machine">{machineName}</Dl>
            <Dl k="Machine ID">{workOrder.machineId}</Dl>
            <Dl k="Department">{department}</Dl>
            <Dl k="Maintenance type">
              {workOrder.maintenanceType}
            </Dl>
            <Dl k="Priority">
              <PBadge p={priority} />
            </Dl>
            <Dl k="Status">
              <WBadge
                w={{
                  status,
                  scheduledEnd: workOrder.scheduledEnd,
                  scheduledStart: workOrder.scheduledStart
                }}
              />
            </Dl>
            <Dl k="Assigned engineer">
              {workOrder.assignedToUserName || 'Unassigned'}
            </Dl>
            <Dl k="Created by">
              {workOrder.createdByUserId ?? '—'}
            </Dl>
            <Dl k="Scheduled start">
              {dateTime(workOrder.scheduledStart)}
            </Dl>
            <Dl k="Scheduled end">
              {dateTime(workOrder.scheduledEnd)}
            </Dl>
            <Dl k="Actual start">
              {dateTime(workOrder.actualStart)}
            </Dl>
            <Dl k="Actual completion">
              {dateTime(workOrder.actualEnd)}
            </Dl>
            <Dl k="Description" full>
              {workOrder.description}
            </Dl>
            <Dl k="Notes" full>
              {workOrder.notes}
            </Dl>
          </div>
        </div>
      </div>

      <p className="muted" style={{ fontSize: 12.5 }}>
        Work-order information is fetched from the backend when this
        drawer opens.
      </p>
    </Frame>
  );
}


/* ---------- breakdown ---------- */
function BdDrawer({ id }) {
  const b = B(id), m = M(b.mid), mgr = isMgr(), own = b.eng === ME_ID, i = BSTAT.indexOf(b.status);
  const acts = [];
  if (mgr) {
    acts.push(<Btn key="a" ico="users" onClick={() => openModal('bdAssign', { id })}>Assign Engineer</Btn>, <Btn key="s" cls="primary" ico="flag" onClick={() => openModal('bdStatus', { id })}>Update Status</Btn>);
    if (!b.wo) acts.push(<Btn key="w" ico="plus" onClick={() => { closeDrawer(); openModal('schedule', { mid: b.mid, type: 'Breakdown Maintenance', prio: b.severity, desc: `Repair: ${b.desc}`, bd: b.id }); }}>Create Work Order</Btn>);
  } else if (own && bdActive(b)) {
    if (['Reported', 'Acknowledged'].includes(b.status)) acts.push(<Btn key="st" cls="primary" ico="play" onClick={() => bdStart(id)}>Start Repair</Btn>);
    if (b.status === 'Under Repair') { acts.push(<Btn key="f" ico="edit" onClick={() => openModal('bdFind', { id })}>Record Findings</Btn>); if (!b.ready) acts.push(<Btn key="r" cls="primary" ico="checkc" onClick={() => bdReady(id)}>Mark Ready for Resolution</Btn>); }
  }
  const notes = [];
  if (!mgr && !own) notes.push(['t-off', 'lock', `Assigned to ${uname(b.eng)}. Read-only for you.`]);
  if (!mgr && own && bdActive(b)) notes.push(['t-info', 'info', 'Only a manager can mark a breakdown Resolved. Use "Mark Ready for Resolution" when repairs are done.']);
  if (b.ready && bdActive(b)) notes.push(['t-ok', 'checkc', 'Engineer has marked this breakdown ready for resolution.']);
  const log = b.notes.slice().sort((a, c) => c.t.localeCompare(a.t));
  return (
    <Frame code={b.id} title={m.name} badges={<><BBadge s={b.status} /><PBadge p={b.severity} /><Badge cls="b-off" flat>{m.dept}</Badge></>}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} aria-label="Breakdown progress">
        {BSTAT.map((s, k) => <span key={s} className={`badge ${k < i ? 'b-ok' : k === i ? 'b-prog' : 'b-off'} flat`} aria-current={k === i ? 'step' : undefined}>{k < i ? '✓ ' : ''}{s}</span>)}
      </div>
      {acts.length > 0 && <div className="actions">{acts}</div>}
      {notes.map((n, k) => <Note key={k} tone={n[0]} ico={n[1]}>{n[2]}</Note>)}
      <div className="card"><div className="card-b"><div className="sec-t"><Ico n="alert" />Breakdown details</div><div className="dl">
        <Dl k="Breakdown ID"><span className="mono">{b.id}</span></Dl><Dl k="Machine"><MLink id={b.mid} /></Dl><Dl k="Machine status"><MBadge s={m.status} /></Dl><Dl k="Department">{m.dept}</Dl><Dl k="Reported">{fmtDT(b.reported)}</Dl><Dl k="Severity"><PBadge p={b.severity} /></Dl>
        <Dl k="Reported by">{b.by}</Dl><Dl k="Assigned engineer">{uname(b.eng)}</Dl><Dl k="Description" full>{b.desc}</Dl><Dl k="Root cause" full>{b.rootCause}</Dl><Dl k="Corrective action" full>{b.action}</Dl>
        <Dl k="Repair start">{b.repairStart ? fmtDT(b.repairStart) : 'Not started'}</Dl><Dl k="Resolution">{b.resolved ? fmtDT(b.resolved) : 'Not resolved'}</Dl><Dl k="Total downtime">{hrs(bdHours(b)) + (bdActive(b) ? ' and counting' : '')}</Dl>
        <Dl k="Related work order">{b.wo ? <><button type="button" className="btn sm ghost" style={link} onClick={() => openDrawer('wo', b.wo)}><span className="mono">{b.wo}</span></button> <WBadge w={W(b.wo)} noOd /></> : 'None yet'}</Dl>
      </div></div></div>
      <div className="card"><div className="card-b"><div className="sec-t"><Ico n="clock" />Notes and updates</div>
        {log.length ? <div className="list" style={{ margin: '0 -18px -16px' }}>{log.map((n, k) => <div className="li" key={k}><span className="ico t-info"><Ico n="edit" /></span><span className="body"><span className="tt">{n.who}</span> <span className="meta">{fmtShort(n.t)}</span><br /><span className="tx" style={{ color: 'var(--text)' }}>{n.text}</span></span></div>)}</div> : <p className="muted">No updates recorded.</p>}
      </div></div>
    </Frame>
  );
}

/* ---------- user ---------- */
function UserDrawer({ id }) {
  const u = U(id), open = WOS.filter(w => w.eng === id && OPEN.includes(w.status)), done = WOS.filter(w => w.eng === id && w.status === 'Completed').length;
  const ms = MACHINES.filter(m => m.eng === id);
  return (
    <Frame code={u.id} title={u.name} badges={<><UBadge s={u.status} /><Badge cls="b-off" flat>{u.role}</Badge></>}>
      <div className="actions">
        <Btn ico="edit" onClick={() => openModal('userForm', { id })}>Edit User</Btn><Btn onClick={() => openModal('userRole', { id })}>Assign Role</Btn><Btn onClick={() => openModal('userDept', { id })}>Assign Department</Btn>
        <Btn cls={u.status === 'Active' ? 'danger' : ''} onClick={() => userToggle(id)}>{u.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}</Btn>
      </div>
      <div className="card"><div className="card-b"><div className="sec-t"><Ico n="user" />Account</div><div className="dl">
        <Dl k="Full name">{u.name}</Dl><Dl k="User ID"><span className="mono">{u.id}</span></Dl><Dl k="Email">{u.email}</Dl><Dl k="Phone">{u.phone}</Dl><Dl k="Role">{u.role}</Dl><Dl k="Department">{u.dept}</Dl><Dl k="Account status"><UBadge s={u.status} /></Dl><Dl k="Last active">{fmtDT(u.last)}</Dl>
      </div></div></div>
      <div className="card"><div className="card-b"><div className="sec-t"><Ico n="wrench" />Workload</div><div className="dl">
        <Dl k="Open work orders"><b className="num">{open.length}</b></Dl><Dl k="Completed work orders"><b className="num">{done}</b></Dl>
        <Dl k="Assigned machines" full>{ms.length > 0 && ms.map(m => <div key={m.id}><span className="mono">{m.id}</span> {m.name}</div>)}</Dl>
      </div></div></div>
      <Note tone="t-info" ico="info">Prototype only. Roles and permissions shown here are simulated and no credentials are stored.</Note>
    </Frame>
  );
}
const MAP = { machine: MachineDrawer, wo: WoDrawer, bd: BdDrawer, user: UserDrawer };
export default function DrawerHost() {
  if (!S.drawer) return null;
  const C = MAP[S.drawer.kind];
  return <C id={S.drawer.id} />;
}
