/* Simulated business actions. Each one changes the in-memory sample data, then re-renders. */
import { WOS, BDS, USERS, MACHINES, ME_ID } from '../data/data';
import { W, B, M, U, uname, nowISO, fmtDate, lastMaint, bdActive } from './model';
import { S, emit, toast, closeModal, logAct, notify } from './store';
import { apiRequest } from './api';

/* after an action: close any modal, re-render, show a toast */
export const done = (msg, kind) => { S.modal = null; emit(); toast(msg, kind); };

/* ---- work orders ---- */

const updateWorkOrderStatus = async (id, status, remarks = '') => {
  try {
    await apiRequest(`/workorders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });

    
    emit();
    toast(`Work order ${id} updated to ${status}.`, 'ok');
    window.dispatchEvent(new Event('emms:refresh'));
  } catch (error) {
    toast(error.message || 'Could not update work order.', 'err');
  }
};

export const woStart = id =>
  updateWorkOrderStatus(id, 'In Progress');

export const woResume = id =>
  updateWorkOrderStatus(id, 'In Progress');

export const woRelease = id =>
  updateWorkOrderStatus(id, 'Open');

export const woHold = (id, reason) =>
  updateWorkOrderStatus(id, 'On Hold', `On hold: ${reason}`);

export const woCancel = (id, reason) =>
  updateWorkOrderStatus(id, 'Cancelled', `Cancelled: ${reason}`);
export const woReassign = (id, eng) => {
  const w = W(id); w.eng = eng; logAct('assign', `${w.id} assigned to ${uname(eng)}.`);
  if (eng === ME_ID) notify('Engineer', 'warn', 'Work order assigned', `${w.id} ${M(w.mid).name} has been assigned to you.`, 'maintenance');
  done(`${w.id} assigned to ${uname(eng)}.`);
};
export const woEdit = (id, d) => { Object.assign(W(id), d); logAct('update', `${id} details edited.`); done(`${id} updated.`); };
export const woSaveExec = (id, d) => { Object.assign(W(id), d); logAct('update', `${uname(W(id).eng)} recorded findings on ${id}.`); done('Findings saved.'); };
export const woComplete = (id, d) => {
  const w = W(id); Object.assign(w, d); w.status = 'Completed'; w.end = nowISO(); w.start = w.start || w.end;
  logAct('done', `Work order ${w.id} completed for ${M(w.mid).name}.`);
  notify('Manager', 'ok', 'Work order completed', `${w.id} ${M(w.mid).name} completed by ${uname(w.eng)}.`, 'maintenance');
  const m = M(w.mid);
  done(`${w.id} completed. Last maintenance for ${m.id} is now ${fmtDate(lastMaint(m))}.${w.bd ? ' Related breakdown must be resolved separately.' : ''}`);
};
export const woCreate = (wo, preBd) => {
  WOS.push(wo); if (preBd) B(preBd).wo = wo.id; const m = M(wo.mid);
  logAct('create', `Work order ${wo.id} created for ${m.name} and assigned to ${uname(wo.eng)}.`);
  if (wo.eng === ME_ID) notify('Engineer', ['High', 'Critical'].includes(wo.priority) ? 'crit' : 'info', 'Work order assigned', `${wo.id} ${m.name} (${wo.priority}) assigned to you for ${fmtDate(wo.sched)}.`, 'maintenance');
  done(`${wo.id} scheduled for ${m.name}. Last maintenance date is unchanged.`);
};

/* ---- machines ---- */
export const machineSave = (id, d) => {
  if (id) { Object.assign(M(id), d); logAct('update', `Machine ${id} details updated.`); done(`${id} updated.`); }
  else { MACHINES.push({ ...d, base: d.inst }); logAct('create', `Machine ${d.id} ${d.name} added to ${d.dept}.`); done(`${d.id} added to ${d.dept}.`); }
};

/* ---- breakdowns ---- */
const bdNote = (b, who, text) => b.notes.push({ t: nowISO(), who, text });
const syncMachine = b => { const m = M(b.mid); if (bdActive(b)) m.status = 'Breakdown'; else if (m.status === 'Breakdown' && !BDS.some(x => x.mid === b.mid && x.id !== b.id && bdActive(x))) m.status = 'Operational'; };
export const bdAssign = (id, eng) => {
  const b = B(id); b.eng = eng; if (b.status === 'Reported') b.status = 'Acknowledged';
  bdNote(b, 'Admin User', `Assigned to ${uname(eng)}.`); logAct('assign', `Breakdown ${b.id} assigned to ${uname(eng)}.`);
  if (eng === ME_ID) notify('Engineer', 'crit', 'Breakdown assigned', `${b.id} ${M(b.mid).name} has been assigned to you.`, 'breakdowns');
  done(`${b.id} assigned to ${uname(eng)}.`);
};
export const bdSetStatus = (id, s, rc, ca) => {
  const b = B(id), fin = ['Resolved', 'Closed'].includes(s);
  if (fin) { if (!b.resolved) { b.resolved = nowISO(); b.rootCause = rc; b.action = ca; b.repairStart = b.repairStart || b.reported; } }
  else { b.resolved = null; if (s === 'Under Repair') b.repairStart = b.repairStart || nowISO(); }
  b.status = s; syncMachine(b); bdNote(b, 'Admin User', `Status changed to ${s}.`); logAct(fin ? 'done' : 'update', `Breakdown ${b.id} status set to ${s}.`);
  done(`${b.id} is now ${s}.${fin && M(b.mid).status === 'Operational' ? ' ' + b.mid + ' returned to Operational.' : ''}`);
};
export const bdStart = id => { const b = B(id); b.status = 'Under Repair'; b.repairStart = nowISO(); bdNote(b, uname(b.eng), 'Repair started.'); logAct('update', `Repair started on ${b.id} by ${uname(b.eng)}.`); done(`${b.id} is now Under Repair.`); };
export const bdFindings = (id, rc, ca, note) => { const b = B(id); b.rootCause = rc; b.action = ca; bdNote(b, uname(b.eng), note || 'Findings updated.'); done('Findings saved.'); };
export const bdReady = id => { const b = B(id); b.ready = true; bdNote(b, uname(b.eng), 'Repair complete. Marked ready for resolution.'); notify('Manager', 'info', 'Breakdown ready for resolution', `${b.id} ${M(b.mid).name} is ready to be resolved.`, 'breakdowns'); done(`${b.id} marked ready for resolution. A manager will resolve it.`); };

/* ---- users ---- */
export const userSave = (id, d) => {
  if (id) { Object.assign(U(id), d); logAct('update', `User ${d.name} updated.`); done(`${d.name} updated.`); }
  else { const nid = 'U-' + String(Math.max(...USERS.map(x => +x.id.slice(2))) + 1).padStart(3, '0'); USERS.push({ id: nid, last: nowISO(), phone: '+91 00000 1' + nid.slice(2) + '0', ...d }); logAct('create', `User account ${d.name} created.`); done(`${d.name} added (${nid}).`); }
};
export const userToggle = async (id, isActive) => {
  const storedUser =
    JSON.parse(localStorage.getItem('emms_user') || 'null') ||
    JSON.parse(sessionStorage.getItem('emms_user') || 'null');

  const currentUserId = Number(storedUser?.userId ?? storedUser?.id);

  if (currentUserId && currentUserId === Number(id) && isActive) {
    toast('You cannot deactivate your own account.', 'err');
    return false;
  }

  try {
    const endpoint = isActive
      ? `/users/${id}/deactivate`
      : `/users/${id}/reactivate`;

    await apiRequest(endpoint, { method: 'PATCH' });

    toast(
      isActive ? 'User deactivated successfully.' : 'User reactivated successfully.',
      'ok'
    );

    window.dispatchEvent(new Event('emms:users-refresh'));
    return true;
  } catch (error) {
    toast(error.message || 'Could not update user status.', 'err');
    return false;
  }
};
export const userSet = (id, key, val, label) => { const u = U(id); u[key] = val; logAct('update', `${u.name}: ${label.toLowerCase()} set to ${val}.`); done(`${u.name}: ${label.toLowerCase()} updated.`); };

/* ---- notifications ---- */
export const readAll = list => { list.forEach(n => (n.read = true)); emit(); };
