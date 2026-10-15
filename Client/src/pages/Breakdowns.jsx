/* Breakdown management: KPIs, filters and table. Breakdown records are separate from work orders. */
import { BDS, DEPTS, BSTAT, PRIO, WOS, ME_ID } from '../data/data';
import { Opts, Icon, Kpi, Badge, EmptyState, PBadge, BBadge, SortTh, Pager, sortBy, pageRows, setF } from '../components/ui';
import { F, isMgr, deptFilter, openDrawer } from '../lib/store';
import { M, bDept, uname, bdActive, bdHours, hrs, fmtDT, TODAY, OPEN } from '../lib/model';
import { changeDept } from './Machines';

export const bdMine = b => b.eng === ME_ID || M(b.mid).eng === ME_ID || WOS.some(w => w.eng === ME_ID && w.mid === b.mid && OPEN.includes(w.status));

export default function Breakdowns() {
  const f = F.bd, mgr = isMgr();
  let base = BDS.slice();
  if (!mgr && !f.all) base = base.filter(bdMine);
  const d = deptFilter('bd'); if (d !== 'All Departments') base = base.filter(b => bDept(b) === d);
  let rows = base.slice();
  if (f.status !== 'All') rows = rows.filter(b => b.status === f.status);
  if (f.sev !== 'All') rows = rows.filter(b => b.severity === f.sev);
  const q = f.q.trim().toLowerCase(); if (q) rows = rows.filter(b => [b.id, b.mid, M(b.mid).name, b.desc, b.by, uname(b.eng)].join(' ').toLowerCase().includes(q));
  rows = sortBy(rows, 'bd', { mname: b => M(b.mid).name, dept: bDept, eng: b => uname(b.eng), down: bdHours, severity: b => PRIO.indexOf(b.severity) });
  const act = base.filter(bdActive), tot = base.reduce((a, x) => a + bdHours(x), 0);
  const thisMonth = x => x.resolved && x.resolved.slice(0, 7) === TODAY.slice(0, 7);

  return (
    <>
      <div className="page-h"><div><h2>Breakdown Management</h2><p>{mgr ? 'Track equipment failures, repair progress and downtime. Breakdown records are separate from maintenance work orders but can be linked.' : 'Breakdowns on your machines and assignments. Tick "Show all breakdowns" to browse the rest read-only.'}</p></div></div>
      <div className="grid g5">
        <Kpi label="Total Breakdowns" val={base.length} ico="alert" tone="info" sub="Since August 2026" />
        <Kpi label="Active Breakdowns" val={act.length} ico="alert" tone={act.length ? 'crit' : 'ok'} sub="Reported, acknowledged or under repair" />
        <Kpi label="Critical Breakdowns" val={base.filter(x => x.severity === 'Critical').length} ico="bolt" tone="crit" sub={`${act.filter(x => x.severity === 'Critical').length} still active`} />
        <Kpi label="Resolved This Month" val={base.filter(x => ['Resolved', 'Closed'].includes(x.status) && thisMonth(x)).length} ico="checkc" tone="ok" sub="October 2026" />
        <Kpi label="Total Downtime" val={hrs(tot)} ico="clock" tone="warn" sub="Includes ongoing repairs" />
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="fld search"><label className="sr" htmlFor="bq">Search breakdowns</label><Icon name="search" cls="sm" /><input className="inp" id="bq" type="search" placeholder="Search ID, machine, description, engineer" value={f.q} onChange={e => setF('bd', 'q', e.target.value)} /></div>
          <div className="fld"><label htmlFor="bdp">Department</label><select className="inp" id="bdp" value={d} onChange={e => changeDept('bd', e.target.value)}><Opts list={['All Departments', ...DEPTS]} /></select></div>
          <div className="fld"><label htmlFor="bs">Status</label><select className="inp" id="bs" value={f.status} onChange={e => setF('bd', 'status', e.target.value)}><Opts list={BSTAT} all="All" /></select></div>
          <div className="fld"><label htmlFor="bv">Severity</label><select className="inp" id="bv" value={f.sev} onChange={e => setF('bd', 'sev', e.target.value)}><Opts list={[...PRIO].reverse()} all="All" /></select></div>
          {!mgr && <label className="chk" style={{ paddingBottom: 9 }}><input type="checkbox" id="ball" checked={f.all} onChange={e => setF('bd', 'all', e.target.checked)} />Show all breakdowns</label>}
        </div>
        {rows.length ? (
          <>
            <div className="tbl-wrap"><table>
              <thead><tr><SortTh p="bd" k="id">Breakdown</SortTh><SortTh p="bd" k="mid">Machine ID</SortTh><SortTh p="bd" k="mname">Machine Name</SortTh><SortTh p="bd" k="dept">Department</SortTh><SortTh p="bd" k="reported">Reported</SortTh><SortTh p="bd" k="severity">Severity</SortTh><th>Description</th><th>Reported By</th><SortTh p="bd" k="eng">Engineer</SortTh><SortTh p="bd" k="down">Downtime</SortTh><SortTh p="bd" k="status">Status</SortTh><th>Actions</th></tr></thead>
              <tbody>{pageRows(rows, 'bd').map(b => (
                <tr className="row click" key={b.id} onClick={() => openDrawer('bd', b.id)}>
                  <td className="mono">{b.id}</td><td className="mono">{b.mid}</td><td className="cell-main">{M(b.mid).name}</td><td>{bDept(b)}</td><td className="nowrap">{fmtDT(b.reported)}</td><td><PBadge p={b.severity} /></td>
                  <td style={{ minWidth: 240 }}>{b.desc}</td><td>{b.by}</td><td>{uname(b.eng)}</td>
                  <td className="nowrap"><span className="num">{hrs(bdHours(b))}</span>{bdActive(b) && <div className="cell-sub">ongoing</div>}</td>
                  <td><BBadge s={b.status} />{b.ready && <div style={{ marginTop: 4 }}><Badge cls="b-info" flat>Ready for resolution</Badge></div>}</td>
                  <td><button type="button" className="btn sm" onClick={e => { e.stopPropagation(); openDrawer('bd', b.id); }}>View</button></td>
                </tr>))}</tbody>
            </table></div>
            <Pager total={rows.length} p="bd" />
          </>
        ) : <EmptyState title="No breakdowns match" text="Try clearing the search or changing a filter." />}
      </div>
    </>
  );
}
