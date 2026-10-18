/* Manager dashboard: KPIs, department overview, analytics, alerts, upcoming work, critical machines, activity. */
import { MACHINES, WOS, BDS, ACTIVITY, DEPTS, MSTAT, WSTAT, PLANNED, HIST_BD, HIST_RATE, RATE_MONTHS, NOW } from '../data/data';
import { Icon, Badge, Kpi, EmptyState, MBadge, PBadge, WBadge, stop } from '../components/ui';
import ChartCanvas, { cssVar } from '../components/ChartCanvas';
import { S, emit, navigate, openDrawer, openModal } from '../lib/store';
import { M, uname, wDept, bDept, isOverdue, bdActive, bdHours, lastMaint, nextMaint, mWarn, mBds, inDept, countBy, fmtDate, fmtDT, fmtShort, nowISO, hrs, sevCls, sevIcon } from '../lib/model';
import { useState } from 'react';
import Chatbot from '../components/Chatbot';

const ACT_CLS = { create: 't-info', assign: 't-info', done: 't-ok', breakdown: 't-crit', update: 't-warn' };
const ACT_ICO = { create: 'plus', assign: 'users', done: 'checkc', breakdown: 'alert', update: 'wrench' };

export default function ManagerDashboard() {
  const [chatOpen, setChatOpen] = useState(false);
  const dept = S.dept, ind = d => inDept(dept, d);
  const ms = MACHINES.filter(m => ind(m.dept)), ws = WOS.filter(w => ind(wDept(w))), bs = BDS.filter(b => ind(bDept(b)));
  const horizon = new Date(NOW.getTime() + 7 * 864e5);
  const over = ws.filter(isOverdue);
  const up = ws.filter(w => w.status === 'Scheduled' && !isOverdue(w) && new Date(w.sched) <= horizon).sort((a, b) => a.sched.localeCompare(b.sched));
  const act = bs.filter(bdActive), open = ws.filter(w => ['Scheduled', 'In Progress', 'On Hold'].includes(w.status)), ops = ms.filter(m => m.status === 'Operational');
  const oldest = over.length ? Math.max(...over.map(w => Math.floor((NOW - new Date(w.sched)) / 864e5))) : 0;
  const crit = act.filter(b => b.severity === 'Critical').length;

  /* alerts, ranked by severity */
  const al = [];
  act.filter(b => b.severity === 'Critical').forEach(b => al.push({ r: 0, sev: 'crit', t: 'Critical machine breakdown', x: `${b.mid} ${M(b.mid).name}: ${b.desc} Down ${hrs(bdHours(b))}.`, kind: 'bd', id: b.id }));
  MACHINES.filter(m => ind(m.dept) && mBds(m).length >= 3).forEach(m => al.push({ r: 1, sev: 'crit', t: 'Repeated breakdown on a machine', x: `${m.id} ${m.name} has ${mBds(m).length} breakdowns recorded since August.`, kind: 'machine', id: m.id }));
  over.forEach(w => al.push({ r: 2, sev: 'warn', t: w.type === 'Preventive Maintenance' ? 'Overdue preventive maintenance' : 'Overdue maintenance job', x: `${w.id} ${M(w.mid).name}, due ${fmtDate(w.sched)}. Machine status: ${M(w.mid).status}.`, kind: 'wo', id: w.id }));
  ws.filter(w => w.status === 'Scheduled' && ['High', 'Critical'].includes(w.priority) && !isOverdue(w)).forEach(w => al.push({ r: 3, sev: 'warn', t: 'High-priority work order awaiting action', x: `${w.id} ${M(w.mid).name} (${w.priority}) scheduled ${fmtShort(w.sched)}, not yet started.`, kind: 'wo', id: w.id }));
  al.sort((a, b) => a.r - b.r);

  const cm = ms.filter(m => m.status === 'Breakdown' || mWarn(m).length).sort((a, b) => (b.status === 'Breakdown') - (a.status === 'Breakdown'));

  /* chart data */
  const C = { ok: cssVar('--ok'), info: cssVar('--info'), crit: cssVar('--crit'), off: cssVar('--off'), warn: cssVar('--warn'), steel: cssVar('--link'), card: cssVar('--card') };
  const grid = { color: cssVar('--line2') }, dl = DEPTS.filter(ind);
  const legend = { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } };
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], mi = { Aug: 7, Sep: 8, Oct: 9 };
  const trend = months.map((m, i) => (i < 3 ? dl.reduce((a, d) => a + HIST_BD[d][i], 0) : bs.filter(b => new Date(b.reported).getMonth() === mi[m]).length));
  const rate = RATE_MONTHS.map((_, i) => Math.round(dl.reduce((a, d) => a + HIST_RATE[d][i], 0) / dl.length));
  const charts = [
    ['chStatus', 'Machine status', 'doughnut', { labels: MSTAT, datasets: [{ data: countBy(ms, MSTAT, m => m.status), backgroundColor: [C.ok, C.info, C.crit, C.off], borderColor: C.card, borderWidth: 2 }] }, { cutout: '62%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true } } } }],
    ['chWO', 'Work-order status', 'bar', { labels: WSTAT, datasets: [{ data: countBy(ws, WSTAT, w => w.status), backgroundColor: [C.info, C.steel, C.warn, C.ok, C.off], borderRadius: 4 }] }, { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid, ticks: { precision: 0 } }, y: { grid: { display: false } } } }],
    ['chPU', 'Planned vs unplanned maintenance', 'bar', { labels: dl, datasets: [{ label: 'Planned', data: dl.map(d => ws.filter(w => wDept(w) === d && w.status !== 'Cancelled' && PLANNED.includes(w.type)).length), backgroundColor: C.steel, borderRadius: 3 }, { label: 'Unplanned', data: dl.map(d => ws.filter(w => wDept(w) === d && w.status !== 'Cancelled' && !PLANNED.includes(w.type)).length), backgroundColor: C.crit, borderRadius: 3 }] }, { plugins: { legend }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid, ticks: { precision: 0 } } } }],
    ['chTrend', 'Breakdown trend (per month)', 'line', { labels: months, datasets: [{ label: 'Breakdowns', data: trend, borderColor: C.crit, backgroundColor: C.crit + '22', fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: C.crit }] }, { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid, ticks: { precision: 0 } } } }],
    ['chRate', 'Maintenance completion rate (%)', 'line', { labels: RATE_MONTHS, datasets: [{ label: 'Completion rate', data: rate, borderColor: C.ok, backgroundColor: C.ok + '22', fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: C.ok }] }, { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { min: 60, max: 100, grid } } }],
    ['chDown', 'Downtime by department (hours)', 'bar', { labels: DEPTS, datasets: [{ label: 'Downtime (h)', data: DEPTS.map(d => +BDS.filter(b => bDept(b) === d).reduce((a, b) => a + bdHours(b), 0).toFixed(1)), backgroundColor: DEPTS.map(d => (ind(d) ? C.steel : C.off + '88')), borderRadius: 4 }] }, { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid } } }]
  ];
  const openAlert = a => openDrawer(a.kind === 'bd' ? 'bd' : a.kind === 'wo' ? 'wo' : 'machine', a.id);
  const pickDept = d => { S.dept = S.dept === d ? 'All Departments' : d; emit(); };

  return (
    <>
      <div className="page-h">
        <div><h2>Plant overview</h2><p>{dept === 'All Departments' ? 'Equipment health, maintenance workload and breakdown risk across all three departments.' : `Filtered to ${dept}. Use the department selector to change.`} Prototype clock: {fmtDT(nowISO())}.</p></div>
        <div className="actions">
          <button type="button" className="btn primary" onClick={() => openModal('schedule', {})}><Icon name="plus" cls="sm" />Schedule Maintenance</button>
          <button type="button" className="btn" onClick={() => navigate('manager/machines')}><Icon name="cog" cls="sm" />View Machines</button>
          <button type="button" className="btn" onClick={() => navigate('manager/breakdowns')}><Icon name="alert" cls="sm" />View Breakdowns</button>
          <button type="button" className="btn" onClick={() => navigate('manager/users')}><Icon name="users" cls="sm" />Manage Users</button>
        </div>
      </div>

      <div className="grid g6">
        <Kpi label="Total Machines" val={ms.length} ico="cog" tone="info" sub={dept === 'All Departments' ? '3 departments' : dept} to="manager/machines" />
        <Kpi label="Operational Machines" val={ops.length} ico="checkc" tone="ok" sub={`${ms.length ? Math.round(ops.length / ms.length * 100) : 0}% of fleet`} to="manager/machines" />
        <Kpi label="Overdue Maintenance" val={over.length} ico="clock" tone={over.length ? 'warn' : 'ok'} sub={over.length ? `Oldest ${oldest} days late` : 'Nothing overdue'} to="manager/maintenance" />
        <Kpi label="Upcoming (next 7 days)" val={up.length} ico="cal" tone="info" sub="Scheduled, not yet due" to="manager/maintenance" />
        <Kpi label="Active Breakdowns" val={act.length} ico="alert" tone={act.length ? 'crit' : 'ok'} sub={crit ? `${crit} critical` : 'None critical'} to="manager/breakdowns" />
        <Kpi label="Open Work Orders" val={open.length} ico="clip" tone="warn" sub={`${ws.filter(w => w.status === 'In Progress').length} in progress`} to="manager/maintenance" />
      </div>

      <div>
        <div className="sec-t">Departments</div>
        <div className="grid g3">
          {DEPTS.map(d => {
            const m = MACHINES.filter(x => x.dept === d), n = k => m.filter(x => x.status === k).length;
            const ab = BDS.filter(b => bDept(b) === d && bdActive(b)).length, od = WOS.filter(w => wDept(w) === d && isOverdue(w)).length;
            const seg = [['Operational', 'ok'], ['Under Maintenance', 'info'], ['Breakdown', 'crit'], ['Inactive', 'off']];
            return (
              <button type="button" key={d} className={`card dept-card${S.dept === d ? ' on' : ''}`} onClick={() => pickDept(d)} aria-pressed={S.dept === d}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ fontSize: 20 }}>{d}</h3><span className="muted" style={{ fontSize: 12 }}>{S.dept === d ? 'Filtering dashboard' : 'Click to filter'}</span></div>
                <div className="bar" aria-hidden="true">{seg.map(([k, c]) => <i key={k} style={{ width: `${n(k) / m.length * 100}%`, background: `var(--${c})` }} title={`${k}: ${n(k)}`} />)}</div>
                <div className="stats">
                  <div><b>{m.length}</b>Total machines</div>
                  <div><b style={{ color: 'var(--ok)' }}>{n('Operational')}</b>Operational</div>
                  <div><b style={{ color: 'var(--info)' }}>{n('Under Maintenance')}</b>Under maintenance</div>
                  <div><b style={{ color: ab ? 'var(--crit)' : 'inherit' }}>{ab}</b>Active breakdowns</div>
                  <div><b style={{ color: od ? 'var(--warn)' : 'inherit' }}>{od}</b>Overdue jobs</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="sec-t">Analytics</div>
        <div className="grid g3">
          {charts.map(([id, label, type, data, options]) => (
            <div className="card" key={id}><div className="card-h"><h3>{label}</h3></div><div className="card-b"><ChartCanvas id={id} label={label} type={type} data={data} options={options} themeKey={S.theme || 'system'} /></div></div>
          ))}
        </div>
      </div>

      <div className="grid g-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div className="card">
            <div className="card-h"><h3>Alerts and attention required</h3><Badge cls={al.length ? 'b-crit' : 'b-ok'}>{al.length} open</Badge></div>
            <div className="list">
              {al.length ? al.map((a, i) => (
                <button type="button" className="li" key={i} onClick={() => openAlert(a)}>
                  <span className={`ico ${sevCls[a.sev]}`}><Icon name={sevIcon[a.sev]} cls="sm" /></span>
                  <span className="body"><span className="tt">{a.t}</span><br /><span className="tx">{a.x}</span></span>
                  <Badge cls={a.sev === 'crit' ? 'b-crit' : 'b-warn'}>{a.sev === 'crit' ? 'Critical' : 'Warning'}</Badge>
                </button>
              )) : <EmptyState title="No alerts" text="Nothing needs attention in this department." />}
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>Upcoming maintenance</h3><button type="button" className="btn sm" onClick={() => navigate('manager/maintenance')}>All work orders</button></div>
            {up.length ? (
              <div className="tbl-wrap"><table>
                <thead><tr><th>Work Order</th><th>Machine</th><th>Department</th><th>Type</th><th>Scheduled</th><th>Engineer</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>{up.slice(0, 6).map(w => (
                  <tr className="row click" key={w.id} onClick={() => openDrawer('wo', w.id)}>
                    <td className="mono">{w.id}</td><td><div className="cell-main">{M(w.mid).name}</div><div className="cell-sub mono">{w.mid}</div></td><td>{wDept(w)}</td><td>{w.type}</td><td className="nowrap">{fmtShort(w.sched)}</td><td>{uname(w.eng)}</td><td><PBadge p={w.priority} /></td><td><WBadge w={w} /></td>
                  </tr>))}</tbody>
              </table></div>
            ) : <EmptyState title="Nothing scheduled" text="No jobs in the next 7 days for this selection." />}
          </div>
          <div className="card">
            <div className="card-h"><h3>Critical machines</h3><span className="muted" style={{ fontSize: 12.5 }}>Breakdown, repeated failures or overdue work</span></div>
            {cm.length ? (
              <div className="tbl-wrap"><table>
                <thead><tr><th>Machine</th><th>Status</th><th>Last Maint.</th><th>Next Maint.</th><th>Warning</th></tr></thead>
                <tbody>{cm.slice(0, 7).map(m => (
                  <tr className="row click" key={m.id} onClick={() => openDrawer('machine', m.id)}>
                    <td><div className="cell-main">{m.name}</div><div className="cell-sub mono">{m.id} · {m.dept}</div></td><td><MBadge s={m.status} /></td><td className="nowrap">{fmtDate(lastMaint(m))}</td><td className="nowrap">{fmtDate(nextMaint(m))}</td>
                    <td>{mWarn(m).map(x => <div key={x} style={{ fontSize: 12.5 }}>{x}</div>)}</td>
                  </tr>))}</tbody>
              </table></div>
            ) : <EmptyState title="All clear" text="No machines need attention." />}
          </div>
        </div>
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-h"><h3>Recent activity</h3></div>
          <div className="list feed">
            {ACTIVITY.slice(0, 8).map((a, i) => (
              <div className="li" key={i}><span className={`ico ${ACT_CLS[a.type]}`}><Icon name={ACT_ICO[a.type]} cls="sm" /></span><span className="body"><span className="tx" style={{ color: 'var(--text)' }}>{a.text}</span><br /><span className="meta">{fmtShort(a.t)}</span></span></div>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="chat-launcher"
        onClick={() => setChatOpen(true)}
        aria-label="Open AI assistant"
      >
        <span>✦</span> Ask AI
      </button>

      {chatOpen && (
        <Chatbot onClose={() => setChatOpen(false)} />
      )}
    </>
  );
}
