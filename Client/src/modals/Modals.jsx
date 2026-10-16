/* All form modals. Each validates required fields, then calls a simulated action. */
import { DEPTS, MSTAT, CATS, MTYPES, PRIO, BSTAT, USERS, MACHINES, ME_ID, wo as makeWo } from '../data/data';
import { Icon, Field, Opts, Modal, CancelBtn, useForm, UBadge } from '../components/ui';
import { S, closeModal, emit, toast } from '../lib/store';
import { M, U, W, B, uname, wDept, engs, nextWOId, nowISO } from '../lib/model';
import * as A from '../lib/actions';
import { apiRequest } from '../lib/api';
import { useEffect, useState } from 'react';

const Note = ({ tone, children }) => <div className={`note ${tone}`} style={{ marginBottom: 12 }}><Icon name="info" cls="sm" /><span>{children}</span></div>;
const Sub = ({ children }) => <p className="muted" style={{ marginBottom: 12 }}>{children}</p>;
const engOpts = () => engs(true).map(u => [u.id, `${u.name} · ${u.dept}`]);

/* ---------- profile ---------- */
function Profile() {
  const u = S.role === 'Manager' ? U('U-001') : U(ME_ID);
  return (
    <Modal small title="My profile" footer={<CancelBtn label="Close" />}>
      <div className="dl">
        <div><div className="k">Name</div><div className="v">{u.name}</div></div><div><div className="k">User ID</div><div className="v mono">{u.id}</div></div>
        <div><div className="k">Email</div><div className="v">{u.email}</div></div><div><div className="k">Role</div><div className="v">{u.role}</div></div>
        <div><div className="k">Department</div><div className="v">{u.dept}</div></div><div><div className="k">Status</div><div className="v"><UBadge s={u.status} /></div></div>
      </div>
      <div className="note t-info" style={{ marginTop: 16 }}><Icon name="info" cls="sm" /><span>Prototype only. Role-based visibility here is simulated and provides no real security.</span></div>
    </Modal>
  );
}

/* ---------- machines ---------- */
function MachineForm({ id }) {
  const m = id ? M(id) : { id: '', name: '', dept: DEPTS[0], cat: CATS[0], loc: '', mfr: '', model: '', inst: '', status: 'Operational', freq: 30, eng: engs(true)[0].id };
  const f = useForm({ ...m, freq: String(m.freq) });
  const save = () => {
    if (!f.validate(['id', 'name', 'loc', 'mfr', 'model', 'inst', 'freq'])) return;
    const nid = f.v.id.trim().toUpperCase();
    if (!id && M(nid)) { f.setErr({ id: 'This Machine ID already exists.' }); return; }
    const d = { id: id || nid, name: f.v.name.trim(), dept: f.v.dept, cat: f.v.cat, loc: f.v.loc.trim(), mfr: f.v.mfr.trim(), model: f.v.model.trim(), inst: f.v.inst, status: f.v.status, freq: +f.v.freq, eng: f.v.eng };
    A.machineSave(id, d);
  };
  const e = f.err;
  return (
    <Modal title={id ? 'Edit machine' : 'Add machine'} footer={<><CancelBtn /><button type="button" className="btn primary" onClick={save}>{id ? 'Save changes' : 'Add machine'}</button></>}>
      <div className="form-grid">
        <Field id="id" label="Machine ID" error={e.id}><input className="inp" {...f.bind('id')} readOnly={!!id} placeholder="e.g. CP-MTR-002" /></Field>
        <Field id="name" label="Machine name" error={e.name}><input className="inp" {...f.bind('name')} /></Field>
        <Field id="dept" label="Department"><select className="inp" {...f.bind('dept')}><Opts list={DEPTS} /></select></Field>
        <Field id="cat" label="Category"><select className="inp" {...f.bind('cat')}><Opts list={CATS} /></select></Field>
        <Field id="loc" label="Location" error={e.loc}><input className="inp" {...f.bind('loc')} /></Field>
        <Field id="mfr" label="Manufacturer" error={e.mfr}><input className="inp" {...f.bind('mfr')} /></Field>
        <Field id="model" label="Model number" error={e.model}><input className="inp" {...f.bind('model')} /></Field>
        <Field id="inst" label="Installation date" error={e.inst}><input className="inp" type="date" {...f.bind('inst')} /></Field>
        <Field id="status" label="Operational status"><select className="inp" {...f.bind('status')}><Opts list={MSTAT} /></select></Field>
        <Field id="freq" label="Maintenance frequency (days)" error={e.freq}><input className="inp" type="number" min="1" {...f.bind('freq')} /></Field>
        <Field id="eng" label="Assigned engineer" full><select className="inp" {...f.bind('eng')}><Opts list={engs(true).map(u => [u.id, `${u.name} (${u.dept})`])} /></select></Field>
      </div>
    </Modal>
  );
}

/* ---------- schedule maintenance ---------- */
function Schedule({ mid, type, prio, desc, bd }) {
  const first = mid || MACHINES[0].id, wid = nextWOId();
  const pickEng = id => (engs(true).find(u => u.dept === M(id).dept) || engs(true)[0]).id;
  const f = useForm({ mid: first, type: type || MTYPES[0], prio: prio || 'Medium', desc: desc || '', date: '', time: '08:00', dur: '2', eng: pickEng(first), instr: '', rem: '' });
  const m = M(f.v.mid), e = f.err;
  const onMachine = v => { f.set('mid', v); f.set('eng', pickEng(v)); };
  const save = () => {
    if (!f.validate(['desc', 'date', 'time', 'dur'])) return;
    const w = makeWo(wid, m.id, f.v.type, f.v.desc.trim(), f.v.prio, `${f.v.date}T${f.v.time}`, +f.v.dur, f.v.eng, 'Scheduled', { instr: f.v.instr.trim(), remarks: f.v.rem.trim(), created: nowISO(), bd: bd || null });
    A.woCreate(w, bd);
  };
  return (
    <Modal title="Schedule maintenance" footer={<><CancelBtn /><button type="button" className="btn primary" onClick={save}>Schedule Maintenance</button></>}>
      <div className="form-grid">
        <Field id="sid" label="Work Order ID"><input className="inp mono" id="sid" value={wid} readOnly /></Field>
        <Field id="mid" label="Machine ID"><select className="inp" id="mid" value={f.v.mid} onChange={ev => onMachine(ev.target.value)}><Opts list={MACHINES.map(x => [x.id, `${x.id} · ${x.name}`])} /></select></Field>
        <Field id="snm" label="Machine name"><input className="inp" id="snm" readOnly value={m.name} /></Field>
        <Field id="sdp" label="Department"><input className="inp" id="sdp" readOnly value={m.dept} /></Field>
        <Field id="type" label="Maintenance type"><select className="inp" {...f.bind('type')}><Opts list={MTYPES} /></select></Field>
        <Field id="prio" label="Priority"><select className="inp" {...f.bind('prio')}><Opts list={PRIO} /></select></Field>
        <Field id="desc" label="Work description" full error={e.desc}><textarea className="inp" {...f.bind('desc')} /></Field>
        <Field id="date" label="Scheduled date" error={e.date}><input className="inp" type="date" {...f.bind('date')} /></Field>
        <Field id="time" label="Scheduled time" error={e.time}><input className="inp" type="time" {...f.bind('time')} /></Field>
        <Field id="dur" label="Estimated duration (hours)" error={e.dur}><input className="inp" type="number" min="0.5" step="0.5" {...f.bind('dur')} /></Field>
        <Field id="eng" label="Assigned engineer"><select className="inp" {...f.bind('eng')}><Opts list={engOpts()} /></select></Field>
        <Field id="instr" label="Maintenance instructions" full><textarea className="inp" {...f.bind('instr')} /></Field>
        <Field id="rem" label="Remarks (optional)" full><input className="inp" {...f.bind('rem')} /></Field>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Scheduling does not change the machine's last maintenance date. That changes only when the job is completed.</p>
    </Modal>
  );
}

/* ---------- work-order actions ---------- */
function WoHold({ id }) {
  const w = W(id), f = useForm({ hr: '' });
  return (
    <Modal small title="Place on hold" footer={<><CancelBtn /><button type="button" className="btn primary" onClick={() => f.validate(['hr']) && A.woHold(id, f.v.hr.trim())}>Place On Hold</button></>}>
      <Sub>{w.id} · {M(w.mid).name}</Sub>
      <Field id="hr" label="Reason for hold" full error={f.err.hr}><textarea className="inp" {...f.bind('hr')} placeholder="e.g. Waiting for spare parts" /></Field>
    </Modal>
  );
}
function WoCancel({ id }) {
  const f = useForm({ cr: '' });
  return (
    <Modal small title="Cancel work order" footer={<><CancelBtn label="Keep Work Order" /><button type="button" className="btn danger" onClick={() => f.validate(['cr']) && A.woCancel(id, f.v.cr.trim())}>Cancel Work Order</button></>}>
      <div className="note t-warn" style={{ marginBottom: 12 }}><Icon name="alert" cls="sm" /><span>A cancelled work order does not count as completed maintenance and will not change the machine's last maintenance date.</span></div>
      <Field id="cr" label="Reason for cancellation" full error={f.err.cr}><textarea className="inp" {...f.bind('cr')} /></Field>
    </Modal>
  );
}
function WoReassign({ id }) {
  const w = W(id), f = useForm({ re: w.eng });
  return (
    <Modal small title="Reassign engineer" footer={<><CancelBtn /><button type="button" className="btn primary" onClick={() => A.woReassign(id, f.v.re)}>Reassign</button></>}>
      <Sub>{w.id} · {M(w.mid).name} ({wDept(w)})</Sub>
      <Field id="re" label="Assigned engineer" full><select className="inp" {...f.bind('re')}><Opts list={engOpts()} /></select></Field>
    </Modal>
  );
}
function WoEdit({ id }) {
  const w = W(id), f = useForm({ ed: w.desc, ep: w.priority, eh: String(w.dur), edt: w.sched.slice(0, 10), etm: w.sched.slice(11, 16), ei: w.instr });
  const save = () => f.validate(['ed', 'eh', 'edt', 'etm']) && A.woEdit(id, { desc: f.v.ed.trim(), priority: f.v.ep, dur: +f.v.eh, sched: `${f.v.edt}T${f.v.etm}`, instr: f.v.ei.trim() });
  const e = f.err;
  return (
    <Modal title="Edit work order" footer={<><CancelBtn /><button type="button" className="btn primary" onClick={save}>Save changes</button></>}>
      <div className="form-grid">
        <Field id="ed" label="Work description" full error={e.ed}><textarea className="inp" {...f.bind('ed')} /></Field>
        <Field id="ep" label="Priority"><select className="inp" {...f.bind('ep')}><Opts list={PRIO} /></select></Field>
        <Field id="eh" label="Estimated duration (hours)" error={e.eh}><input className="inp" type="number" min="0.5" step="0.5" {...f.bind('eh')} /></Field>
        <Field id="edt" label="Scheduled date" error={e.edt}><input className="inp" type="date" {...f.bind('edt')} /></Field>
        <Field id="etm" label="Scheduled time" error={e.etm}><input className="inp" type="time" {...f.bind('etm')} /></Field>
        <Field id="ei" label="Maintenance instructions" full><textarea className="inp" {...f.bind('ei')} /></Field>
      </div>
    </Modal>
  );
}
function ExecFields({ f, withDone }) {
  return (
    <div className="form-grid">
      <Field id="xp" label="Work performed" full error={f.err.xp}><textarea className="inp" {...f.bind('xp')} /></Field>
      <Field id="xf" label="Findings" full><textarea className="inp" {...f.bind('xf')} /></Field>
      <Field id="xa" label="Parts used"><input className="inp" {...f.bind('xa')} /></Field>
      <Field id="xr" label="Engineer remarks"><input className="inp" {...f.bind('xr')} /></Field>
      {withDone && <Field id="xn" label="Completion notes" full error={f.err.xn}><textarea className="inp" {...f.bind('xn')} /></Field>}
    </div>
  );
}
const execInit = w => ({ xp: w.performed, xf: w.findings, xa: w.parts, xr: w.remarks, xn: w.notes });
const execData = v => ({ performed: v.xp.trim(), findings: v.xf.trim(), parts: v.xa.trim(), remarks: v.xr.trim() });


function WoProgress({ id }) {
  const [workOrder, setWorkOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const f = useForm(
    execInit({
      performed: '',
      findings: '',
      parts: '',
      remarks: '',
      notes: '',
    })
  );

  useEffect(() => {
    let cancelled = false;

    apiRequest(`/workorders/${id}`)
      .then(data => {
        if (!cancelled) {
          setWorkOrder(data);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setLoadError(error.message || 'Could not load work order.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const saveProgress = async () => {
    if (!workOrder || saving) return;

    setSaving(true);

    try {
      await apiRequest('/maintenancerecords', {
        method: 'POST',
        body: JSON.stringify({
          machineId: Number(workOrder.machineId),
          workOrderId: Number(workOrder.workOrderId),
          maintenanceDate: new Date().toISOString(),
          findings: f.v.xf.trim(),
          partsUsed: f.v.xa.trim(),
          actionsTaken: f.v.xp.trim(),
          downtimeHours: 0,
          remarks: f.v.xr.trim(),
        }),
      });

      toast('Progress saved successfully.', 'ok');
      closeModal();
      emit();
    } catch (error) {
      toast(error.message || 'Could not save progress.', 'err');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <Modal title="Record findings and progress" footer={<CancelBtn />}>
        <p className="note t-error">{loadError}</p>
      </Modal>
    );
  }

  if (!workOrder) {
    return (
      <Modal title="Record findings and progress" footer={<CancelBtn />}>
        <p>Loading work order...</p>
      </Modal>
    );
  }

  return (
    <Modal
      title="Record findings and progress"
      footer={
        <>
          <CancelBtn />
          <button
            type="button"
            className="btn primary"
            onClick={saveProgress}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save progress'}
          </button>
        </>
      }
    >
      <Sub>Work Order {workOrder.workOrderId} · {workOrder.machineName}</Sub>
      <ExecFields f={f} />
    </Modal>
  );
}



function WoComplete({ id }) {
  const [workOrder, setWorkOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const f = useForm(
    execInit({
      performed: '',
      findings: '',
      parts: '',
      remarks: '',
      notes: '',
    })
  );

  useEffect(() => {
    let cancelled = false;

    apiRequest(`/workorders/${id}`)
      .then(data => {
        if (!cancelled) setWorkOrder(data);
      })
      .catch(error => {
        if (!cancelled) {
          setLoadError(error.message || 'Could not load work order.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const save = async () => {
    if (!f.validate(['xp', 'xn']) || !workOrder || saving) return;

    setSaving(true);

    try {
      await apiRequest('/maintenancerecords', {
        method: 'POST',
        body: JSON.stringify({
          machineId: Number(workOrder.machineId),
          workOrderId: Number(workOrder.workOrderId),
          maintenanceDate: new Date().toISOString(),
          findings: f.v.xf.trim(),
          partsUsed: f.v.xa.trim(),
          actionsTaken: f.v.xp.trim(),
          downtimeHours: 0,
          remarks: [
            f.v.xr.trim(),
            f.v.xn.trim(),
          ].filter(Boolean).join('\n'),
        }),
      });

      await apiRequest(`/workorders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'Completed',
          remarks: f.v.xn.trim(),
        }),
      });

      toast('Work order completed successfully.', 'ok');
      closeModal();
      emit();
      window.dispatchEvent(new Event('emms:refresh'));
    } catch (error) {
      toast(
        error.message || 'Could not complete work order.',
        'err'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <Modal title="Complete work" footer={<CancelBtn />}>
        <p className="note t-error">{loadError}</p>
      </Modal>
    );
  }

  if (!workOrder) {
    return (
      <Modal title="Complete work" footer={<CancelBtn />}>
        <p>Loading work order...</p>
      </Modal>
    );
  }

  return (
    <Modal
      title="Complete work"
      footer={
        <>
          <CancelBtn />
          <button
            type="button"
            className="btn primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Mark Completed'}
          </button>
        </>
      }
    >
      <Sub>
        Work Order {workOrder.workOrderId} · {workOrder.machineName}
      </Sub>

      <Note tone="t-info">
        Completing this job records the maintenance details and updates
        the work order status. The machine's operational status is not
        changed automatically.
      </Note>

      <ExecFields f={f} withDone />
    </Modal>
  );
}


/* ---------- breakdown actions ---------- */
function BdAssign({ id }) {
  const b = B(id), f = useForm({ ba: b.eng });
  return (
    <Modal small title="Assign engineer" footer={<><CancelBtn /><button type="button" className="btn primary" onClick={() => A.bdAssign(id, f.v.ba)}>Assign</button></>}>
      <Sub>{b.id} · {M(b.mid).name}</Sub>
      <Field id="ba" label="Engineer" full><select className="inp" {...f.bind('ba')}><Opts list={engOpts()} /></select></Field>
    </Modal>
  );
}
function BdStatus({ id }) {
  const b = B(id), f = useForm({ bst: b.status, brc: b.rootCause, bca: b.action });
  const fin = ['Resolved', 'Closed'].includes(f.v.bst);
  const save = () => { if (fin && !b.resolved && !f.validate(['brc', 'bca'])) return; A.bdSetStatus(id, f.v.bst, f.v.brc.trim(), f.v.bca.trim()); };
  return (
    <Modal small title="Update breakdown status" footer={<><CancelBtn /><button type="button" className="btn primary" onClick={save}>Update Status</button></>}>
      <div className="form-grid">
        <Field id="bst" label="New status" full><select className="inp" {...f.bind('bst')}><Opts list={BSTAT} /></select></Field>
        {fin && <><Field id="brc" label="Root cause" full error={f.err.brc}><input className="inp" {...f.bind('brc')} /></Field><Field id="bca" label="Corrective action" full error={f.err.bca}><input className="inp" {...f.bind('bca')} /></Field></>}
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Resolving the last active breakdown on a machine returns its operational status to Operational. Related work orders are not changed.</p>
    </Modal>
  );
}
function BdFind({ id }) {
  const b = B(id), f = useForm({ frc: b.rootCause, fca: b.action, fnt: '' });
  return (
    <Modal small title="Record findings" footer={<><CancelBtn /><button type="button" className="btn primary" onClick={() => f.validate(['frc']) && A.bdFindings(id, f.v.frc.trim(), f.v.fca.trim(), f.v.fnt.trim())}>Save</button></>}>
      <div className="form-grid">
        <Field id="frc" label="Root cause" full error={f.err.frc}><input className="inp" {...f.bind('frc')} /></Field>
        <Field id="fca" label="Corrective action" full><input className="inp" {...f.bind('fca')} /></Field>
        <Field id="fnt" label="Progress note" full><textarea className="inp" {...f.bind('fnt')} /></Field>
      </div>
    </Modal>
  );
}

/* ---------- users ---------- */
function UserForm({ id }) {
  const u = id ? U(id) : { name: '', email: '', role: 'Maintenance Engineer', dept: DEPTS[0], status: 'Active' };
  const f = useForm({ name: u.name, email: u.email, role: u.role, dept: u.dept, status: u.status });
  const save = () => {
    if (!f.validate(['name', 'email'])) return;
    const em = f.v.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(em)) { f.setErr({ email: 'Enter a valid email address.' }); return; }
    if (USERS.some(x => x.email.toLowerCase() === em && x.id !== id)) { f.setErr({ email: 'This email is already used by another account.' }); return; }
    A.userSave(id, { name: f.v.name.trim(), email: em, role: f.v.role, dept: f.v.dept, status: f.v.status });
  };
  return (
    <Modal title={id ? 'Edit user' : 'Add user'} footer={<><CancelBtn /><button type="button" className="btn primary" onClick={save}>{id ? 'Save changes' : 'Add user'}</button></>}>
      <div className="form-grid">
        <Field id="name" label="Full name" full error={f.err.name}><input className="inp" {...f.bind('name')} /></Field>
        <Field id="email" label="Email" full error={f.err.email}><input className="inp" type="email" placeholder="name@emms-demo.example" {...f.bind('email')} /></Field>
        <Field id="role" label="Role"><select className="inp" {...f.bind('role')}><Opts list={['Manager', 'Maintenance Engineer']} /></select></Field>
        <Field id="dept" label="Department"><select className="inp" {...f.bind('dept')}><Opts list={['All Departments', ...DEPTS]} /></select></Field>
        <Field id="status" label="Account status" full><select className="inp" {...f.bind('status')}><Opts list={['Active', 'Inactive']} /></select></Field>
      </div>
    </Modal>
  );
}
function QuickUser({ id, k, title, label, list }) {
  const u = U(id), f = useForm({ qv: u[k] });
  return (
    <Modal small title={title} footer={<><CancelBtn /><button type="button" className="btn primary" onClick={() => A.userSet(id, k, f.v.qv, label)}>Save</button></>}>
      <Sub>{u.name}</Sub>
      <Field id="qv" label={label} full><select className="inp" {...f.bind('qv')}><Opts list={list} /></select></Field>
    </Modal>
  );
}

const MAP = {
  profile: Profile, machineForm: MachineForm, schedule: Schedule,
  woHold: WoHold, woCancel: WoCancel, woReassign: WoReassign, woEdit: WoEdit, woProgress: WoProgress, woComplete: WoComplete,
  bdAssign: BdAssign, bdStatus: BdStatus, bdFind: BdFind, userForm: UserForm,
  userRole: p => <QuickUser {...p} k="role" title="Assign role" label="Role" list={['Manager', 'Maintenance Engineer']} />,
  userDept: p => <QuickUser {...p} k="dept" title="Assign department" label="Department" list={['All Departments', ...DEPTS]} />
};
export default function ModalHost() {
  if (!S.modal) return null;
  const C = MAP[S.modal.type];
  /* key forces fresh form state each time a modal opens */
  return <C key={S.modal.type + JSON.stringify(S.modal.props)} {...S.modal.props} />;
}
