/* Public landing page */
import { MACHINES, WOS, BDS, DEPTS } from '../data/data';
import { Icon, Badge } from '../components/ui';
import { navigate } from '../lib/store';
import { bDept, bdActive, bdHours, isOverdue } from '../lib/model';
import { useState } from 'react';
import Chatbot from '../components/Chatbot';

const DEPT_INFO = {
  'Carbon Plant': { art: 'carbon', text: 'Raw coke handling, anode paste mixing, forming and baking. Conveyors, crushers and mixers run continuously and drive anode quality.' },
  Casting: { art: 'casting', text: 'Melting and holding furnaces, cooling water systems and casting machines that turn liquid metal into billets and ingots.' },
  Potline: { art: 'pot', text: 'Rectifiers, busbar cooling, cranes and feeders that keep the electrolysis cells running around the clock.' }
};
const FEATURES = [
  ['cog', 'Equipment Management', 'One register for every machine: identity, location, manufacturer, status, maintenance history and reliability.'],
  ['cal', 'Preventive Maintenance', 'Plan recurring jobs by machine and frequency so inspections and servicing happen before failures do.'],
  ['alert', 'Breakdown Management', 'Log breakdowns, assign engineers, track repair progress and capture root cause and corrective action.'],
  ['clip', 'Work-Order Tracking', 'Follow each job from Scheduled to Completed with findings, parts used and completion notes.'],
  ['chart', 'Maintenance Analytics', 'Machine health, downtime by department, planned versus unplanned work and breakdown trends.'],
  ['shield', 'Role-Based Access', 'Managers see the whole plant. Engineers see their own jobs, machines and breakdowns.']
];
const scrollTo = id => { const e = document.getElementById(id); if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

function DeptArt({ k }) {
  const s = { stroke: '#A9B4C0', strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (k === 'carbon') return (
    <svg viewBox="0 0 320 130" aria-hidden="true">
      <path d="M10 112h300" {...s} /><path d="M30 112 55 78l25 34M60 112l22-26 24 26" {...s} />
      <path d="M120 108 205 52" {...s} strokeWidth={5} /><path d="M118 112l-2-6M205 56l-2-6" {...s} />
      <rect x="210" y="40" width="40" height="30" {...s} />
      <rect x="262" y="26" width="16" height="86" fill="#315A7D" stroke="#A9B4C0" strokeWidth="2" />
      <rect x="284" y="46" width="16" height="66" fill="#315A7D" stroke="#A9B4C0" strokeWidth="2" />
      <path d="M270 20c-6-6 6-10 0-16M292 40c-6-6 6-10 0-16" {...s} opacity=".6" />
    </svg>
  );
  if (k === 'casting') return (
    <svg viewBox="0 0 320 130" aria-hidden="true">
      <path d="M10 112h300" {...s} />
      <path d="M40 112V58q0-18 40-18t40 18v54z" fill="#315A7D" stroke="#A9B4C0" strokeWidth="2" />
      <path d="M120 66h36l14 12" {...s} strokeWidth={5} /><path d="M60 62h40" {...s} stroke="#FFB85C" />
      {[176, 214, 252].map(x => <rect key={x} x={x} y="92" width="32" height="20" fill="#A9B4C0" opacity=".85" />)}
      <path d="M176 84h108" {...s} opacity=".5" />
    </svg>
  );
  return (
    <svg viewBox="0 0 320 130" aria-hidden="true">
      <path d="M10 112h300" {...s} /><path d="M16 30h288" {...s} />
      <rect x="140" y="30" width="44" height="22" fill="#315A7D" stroke="#A9B4C0" strokeWidth="2" />
      <path d="M162 52v18M154 70h16" {...s} />
      {[26, 68, 110, 190, 232, 274].map(x => (
        <g key={x}><rect x={x} y="84" width="36" height="28" fill="#315A7D" stroke="#A9B4C0" strokeWidth="2" /><path d={`M${x + 12} 84v-14M${x + 24} 84v-14`} {...s} /></g>
      ))}
      <path d="M20 78h282" {...s} stroke="#FFB85C" opacity=".7" />
    </svg>
  );
}

export function Brand({ onClick, plain }) {
  return (
    <button type="button" className="brand" onClick={onClick} style={plain ? { padding: 0 } : undefined}>
      <span className="mark">EC</span><span><b>EquipCare</b><small>Equipment Maintenance</small></span>
    </button>
  );
}

export default function Landing() {
  const [chatOpen, setChatOpen] = useState(false);
  const ops = MACHINES.filter(m => m.status === 'Operational').length;
  const od = WOS.filter(isOverdue).length, ab = BDS.filter(bdActive);
  return (
    <div className="pub">
      <header className="pnav">
        <Brand onClick={() => navigate('')} plain />
        <nav aria-label="Primary">
          <button type="button" className="lnk" onClick={() => scrollTo('features')}>Features</button>
          <button type="button" className="lnk" onClick={() => scrollTo('departments')}>Departments</button>
          <button type="button" className="btn primary sm" onClick={() => navigate('login')}>Sign In</button>
        </nav>
      </header>
      <section className="hero wrap">
        <div className="in">
          <div>
            <div className="eyebrow">Aluminium manufacturing · Maintenance operations</div>
            <h1>Smarter Maintenance. Higher Reliability. Less Downtime.</h1>
            <p className="lead">The Smart Equipment Maintenance Management System helps aluminium manufacturing teams monitor equipment, plan preventive maintenance, manage breakdowns, and improve reliability across the Carbon Plant, Casting and Potline.</p>
            <div className="cta">
              <button type="button" className="btn lg primary" onClick={() => navigate('login')}>Sign In <Icon name="arrow" cls="sm" /></button>
              <button type="button" className="btn lg sec" onClick={() => scrollTo('features')}>Explore Features</button>
            </div>
            <div className="stats"><div><b>{MACHINES.length}</b><span>machines tracked</span></div><div><b>3</b><span>departments</span></div><div><b>{WOS.length}</b><span>work orders</span></div></div>
          </div>
          <div className="prev" aria-label="Dashboard preview">
            <div className="pb"><i /><i /><i /><span>manager / dashboard</span></div>
            <div className="k3">
              <div className="k"><small>Operational machines</small><b style={{ color: '#17803F' }}>{ops}<span style={{ fontSize: 14, color: '#5E6B7A' }}> / {MACHINES.length}</span></b></div>
              <div className="k"><small>Overdue jobs</small><b style={{ color: '#9A5B00' }}>{od}</b></div>
              <div className="k"><small>Active breakdowns</small><b style={{ color: '#BF2B2B' }}>{ab.length}</b></div>
            </div>
            <div className="row2">
              <div className="pc"><h5>Downtime by department (h)</h5>
                {DEPTS.map((d, i) => {
                  const h = BDS.filter(b => bDept(b) === d).reduce((a, b) => a + bdHours(b), 0); return (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                      <span style={{ width: 78, color: '#5E6B7A' }}>{d}</span>
                      <span style={{ flex: 1, background: '#EBEFF3', borderRadius: 4, height: 10 }}><i style={{ display: 'block', height: 10, borderRadius: 4, width: `${Math.min(100, h * 2.2)}%`, background: ['#315A7D', '#142B45', '#A9B4C0'][i] }} /></span>
                      <b className="num">{h.toFixed(1)}</b>
                    </div>);
                })}
              </div>
              <div className="pc"><h5>Needs attention</h5>
                {ab.slice(0, 3).map(b => <div className="pr" key={b.id}><span className="mono" style={{ fontSize: 11 }}>{b.mid}</span><span style={{ color: '#BF2B2B', fontWeight: 600 }}>{b.severity}</span></div>)}
                <div className="pr"><span className="mono" style={{ fontSize: 11 }}>WO-2610-012</span><span style={{ color: '#9A5B00', fontWeight: 600 }}>Overdue</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="psec wrap" id="features">
        <h2>Everything the maintenance team works with, in one place</h2>
        <p className="sub">Built around how plant managers and maintenance engineers already work: machines, work orders, breakdowns and people.</p>
        <div className="grid g3">{FEATURES.map(f => <div className="card feat" key={f[1]}><span className="ico"><Icon name={f[0]} /></span><h3>{f[1]}</h3><p>{f[2]}</p></div>)}</div>
      </section>
      <section className="psec wrap" id="departments" style={{ paddingTop: 20 }}>
        <h2>Three departments, one maintenance picture</h2>
        <p className="sub">Each department has its own equipment, engineers and failure modes. EquipCare keeps them comparable.</p>
        <div className="grid g3">
          {DEPTS.map(d => {
            const ms = MACHINES.filter(m => m.dept === d); return (
              <div className="card dcard" key={d}>
                <div className="art"><DeptArt k={DEPT_INFO[d].art} /></div>
                <div className="b"><h3 style={{ fontSize: 21 }}>{d}</h3><p className="muted">{DEPT_INFO[d].text}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Badge cls="b-info" flat>{ms.length} machines</Badge><Badge cls="b-ok" flat>{ms.filter(m => m.status === 'Operational').length} operational</Badge></div></div>
              </div>);
          })}
        </div>
      </section>
      <footer className="pfoot wrap">
        <div className="cols">
          <div style={{ maxWidth: 380 }}>
            <div className="brand" style={{ padding: '0 0 10px', cursor: 'default' }}><span className="mark">EM</span><span><b>EquipCare</b></span></div>
            <p>Smart Equipment Maintenance Management System for aluminium manufacturing: equipment health, preventive maintenance and breakdown control.</p>
          </div>
          <div><b style={{ color: '#fff' }}>Product</b>
            <div style={{ marginTop: 10 }}>
              <button type="button" className="lnk" onClick={() => scrollTo('features')}>Features</button>
              <button type="button" className="lnk" onClick={() => scrollTo('departments')}>Departments</button>
              <button type="button" className="lnk" onClick={() => navigate('login')}>Sign In</button>
            </div>
          </div>
        </div>
        <div className="cp">© 2026 EquipCare. UI/UX prototype with fictional demonstration data.</div>
      </footer>
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
    </div>
  );
}
