/* ===== Sample data (fictional, demo only). Prototype clock is fixed so dates stay coherent. ===== */
export const NOW = new Date('2026-10-10T09:00');
export const DEPTS = ['Carbon Plant', 'Casting', 'Potline'];
export const MTYPES = ['Preventive Maintenance', 'Corrective Maintenance', 'Breakdown Maintenance', 'Inspection', 'Predictive Maintenance'];
export const PLANNED = ['Preventive Maintenance', 'Inspection', 'Predictive Maintenance'];
export const WSTAT = ['Scheduled', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
export const MSTAT = ['Operational', 'Under Maintenance', 'Breakdown', 'Inactive'];
export const BSTAT = ['Reported', 'Acknowledged', 'Under Repair', 'Resolved', 'Closed'];
export const PRIO = ['Low', 'Medium', 'High', 'Critical'];
export const CATS = ['Mixing', 'Conveyor', 'Crushing', 'Fan', 'Press', 'Feeder', 'Furnace', 'Pump', 'Casting', 'Cutting', 'Oven', 'Electrical', 'Crane', 'Cooling', 'Vehicle'];

export const USERS = [
  { id: 'U-001', name: 'Admin User', email: 'admin@emms-demo.example', role: 'Manager', dept: 'All Departments', status: 'Active', last: '2026-10-10T08:52', phone: '+91 00000 10001' },
  { id: 'U-002', name: 'Rahul Sharma', email: 'rahul.sharma@emms-demo.example', role: 'Maintenance Engineer', dept: 'Carbon Plant', status: 'Active', last: '2026-10-10T08:41', phone: '+91 00000 10002' },
  { id: 'U-003', name: 'Amit Kumar', email: 'amit.kumar@emms-demo.example', role: 'Maintenance Engineer', dept: 'Casting', status: 'Active', last: '2026-10-10T08:15', phone: '+91 00000 10003' },
  { id: 'U-004', name: 'Priya Das', email: 'priya.das@emms-demo.example', role: 'Maintenance Engineer', dept: 'Potline', status: 'Active', last: '2026-10-10T07:58', phone: '+91 00000 10004' },
  { id: 'U-005', name: 'Sandeep Patel', email: 'sandeep.patel@emms-demo.example', role: 'Maintenance Engineer', dept: 'Potline', status: 'Active', last: '2026-10-09T21:30', phone: '+91 00000 10005' },
  { id: 'U-006', name: 'Karan Mehta', email: 'karan.mehta@emms-demo.example', role: 'Maintenance Engineer', dept: 'Casting', status: 'Inactive', last: '2026-09-18T16:05', phone: '+91 00000 10006' }
];
export const ME_ID = 'U-002'; // demo engineer: Rahul Sharma

export const mk = (id, name, dept, cat, loc, mfr, model, inst, status, freq, eng, base) =>
  ({ id, name, dept, cat, loc, mfr, model, inst, status, freq, eng, base });
export const MACHINES = [
  mk('CP-MTR-001', 'Anode Mixer Motor', 'Carbon Plant', 'Mixing', 'Paste Plant, Bay 1', 'Siemens', '1LE1-355', '2018-03-14', 'Operational', 28, 'U-002', '2026-09-05'),
  mk('CP-CNV-004', 'Raw Material Conveyor', 'Carbon Plant', 'Conveyor', 'Raw Material Yard', 'Thyssen Handling', 'BC-1200', '2016-07-02', 'Under Maintenance', 45, 'U-002', '2026-08-20'),
  mk('CP-CRS-002', 'Crusher Unit', 'Carbon Plant', 'Crushing', 'Coke Handling, Bay 2', 'Metso', 'NP-1415', '2015-11-20', 'Breakdown', 60, 'U-002', '2026-07-30'),
  mk('CP-FAN-003', 'Baking Furnace Exhaust Fan', 'Carbon Plant', 'Fan', 'Baking Furnace, East', 'Howden', 'HF-900', '2019-05-09', 'Operational', 30, 'U-002', '2026-09-14'),
  mk('CP-PRS-001', 'Anode Forming Press', 'Carbon Plant', 'Press', 'Green Anode Shop', 'Reika', 'VP-2000', '2017-01-25', 'Operational', 30, 'U-002', '2026-09-05'),
  mk('CP-CAL-002', 'Coke Calciner Feeder', 'Carbon Plant', 'Feeder', 'Calcining Area', 'FLSmidth', 'VF-600', '2014-09-18', 'Inactive', 90, 'U-002', '2026-06-30'),
  mk('CS-FRN-002', 'Holding Furnace', 'Casting', 'Furnace', 'Cast House, Line 2', 'Pyrotek', 'HF-45T', '2017-04-11', 'Operational', 30, 'U-003', '2026-09-12'),
  mk('CS-PMP-007', 'Cooling Water Pump', 'Casting', 'Pump', 'Cast House, Pump Room', 'KSB', 'Etanorm 150', '2012-02-28', 'Breakdown', 30, 'U-003', '2026-09-10'),
  mk('CS-CCM-001', 'Casting Machine', 'Casting', 'Casting', 'Cast House, Line 1', 'Wagstaff', 'CPM-6', '2016-10-05', 'Operational', 60, 'U-003', '2026-08-01'),
  mk('CS-FRN-001', 'Melting Furnace', 'Casting', 'Furnace', 'Cast House, Line 1', 'Pyrotek', 'MF-60T', '2016-10-05', 'Operational', 30, 'U-003', '2026-09-18'),
  mk('CS-SAW-001', 'Billet Saw', 'Casting', 'Cutting', 'Cast House, Finishing', 'Wagstaff', 'BS-400', '2019-08-22', 'Operational', 45, 'U-003', '2026-09-02'),
  mk('CS-HMG-001', 'Homogenizing Oven', 'Casting', 'Oven', 'Cast House, Annex', 'Granco Clark', 'HO-30', '2018-12-03', 'Under Maintenance', 60, 'U-003', '2026-08-28'),
  mk('PL-REC-001', 'Rectifier Unit', 'Potline', 'Electrical', 'Rectifier Substation', 'ABB', 'RU-150kA', '2013-06-30', 'Operational', 90, 'U-004', '2026-09-10'),
  mk('PL-CRN-003', 'Potline Crane', 'Potline', 'Crane', 'Potroom 1, Overhead', 'Demag', 'PTM-50', '2013-08-12', 'Operational', 30, 'U-005', '2026-08-30'),
  mk('PL-BUS-002', 'Busbar Cooling System', 'Potline', 'Cooling', 'Potroom 1, Riser', 'Alfa Laval', 'BC-320', '2014-01-17', 'Under Maintenance', 60, 'U-005', '2026-09-01'),
  mk('PL-ALF-004', 'Alumina Point Feeder', 'Potline', 'Feeder', 'Potroom 2, Cell Row B', 'Alutec', 'APF-12', '2020-02-10', 'Operational', 30, 'U-004', '2026-09-22'),
  mk('PL-FTP-001', 'Fume Treatment Fan', 'Potline', 'Fan', 'Gas Treatment Centre', 'Howden', 'ID-1800', '2015-05-21', 'Operational', 30, 'U-005', '2026-08-25'),
  mk('PL-TPV-002', 'Metal Tapping Vehicle', 'Potline', 'Vehicle', 'Potroom 2, Aisle', 'Ravenswood', 'TV-8', '2017-09-07', 'Breakdown', 30, 'U-004', '2026-09-15')
];

export const wo = (id, mid, type, desc, priority, sched, dur, eng, status, x = {}) =>
  Object.assign({ id, mid, type, desc, priority, sched, dur, eng, status, start: null, end: null, performed: '', findings: '', parts: '', remarks: '', notes: '', instr: '', bd: null, created: x.created || '2026-10-01T09:00' }, x);
export const WOS = [
  wo('WO-2610-001', 'CP-CNV-004', 'Corrective Maintenance', 'Replace worn idler rollers and realign belt tracking on conveyor section C.', 'High', '2026-10-09T08:00', 8, 'U-002', 'In Progress', { start: '2026-10-09T08:30', performed: 'Rollers 14-22 removed; new idlers fitted on 14-18. Remaining rollers awaiting fitment.', findings: 'Belt edge fraying near tail pulley.', parts: 'Idler roller x9 (5 fitted)', instr: 'Lock out conveyor, tag drive isolator, check belt tension after fitting.', created: '2026-10-05T10:20' }),
  wo('WO-2610-002', 'CP-CRS-002', 'Breakdown Maintenance', 'Replace cracked jaw plate and inspect toggle assembly after abnormal vibration trip.', 'Critical', '2026-10-10T06:30', 10, 'U-002', 'In Progress', { start: '2026-10-10T06:45', performed: 'Crusher isolated and emptied. Jaw plate removal in progress.', findings: 'Crack across fixed jaw plate; toggle seat shows wear.', parts: 'Fixed jaw plate (ordered from stores)', bd: 'BD-0107', created: '2026-10-10T06:25' }),
  wo('WO-2610-003', 'CP-FAN-003', 'Preventive Maintenance', 'Monthly PM: bearing lubrication, vibration check and belt inspection on exhaust fan.', 'Medium', '2026-10-10T14:00', 3, 'U-002', 'Scheduled', { instr: 'Follow PM checklist CP-FAN-PM-01. Record vibration readings at DE and NDE.', created: '2026-09-28T11:00' }),
  wo('WO-2610-004', 'CP-PRS-001', 'Inspection', 'Quarterly hydraulic system inspection: pressure test, hose condition and oil sample.', 'Medium', '2026-10-07T10:00', 2, 'U-002', 'Scheduled', { instr: 'Take oil sample for lab analysis; inspect all hose clamps.', created: '2026-09-30T09:10' }),
  wo('WO-2610-005', 'CP-MTR-001', 'Predictive Maintenance', 'Vibration and thermography survey on mixer motor and gearbox.', 'Low', '2026-10-13T09:00', 2, 'U-002', 'Scheduled', { created: '2026-10-04T14:00' }),
  wo('WO-2610-006', 'CP-MTR-001', 'Preventive Maintenance', 'Four-weekly PM: greasing, terminal tightening, insulation resistance test.', 'Medium', '2026-10-03T09:00', 3, 'U-002', 'Completed', { start: '2026-10-03T09:10', end: '2026-10-03T12:20', performed: 'Motor greased, terminals torqued, IR test performed.', findings: 'IR value 850 MΩ, within limits. Minor grease leakage at NDE cover.', parts: 'Grease 0.4 kg, gasket x1', remarks: 'Monitor NDE cover on next PM.', notes: 'Completed on schedule.', created: '2026-09-26T10:00' }),
  wo('WO-2610-007', 'CS-PMP-007', 'Breakdown Maintenance', 'Investigate motor overheating trip; rewind or replace pump motor.', 'Critical', '2026-10-10T05:30', 12, 'U-003', 'In Progress', { start: '2026-10-10T05:50', performed: 'Motor disconnected and sent to winding shop for test.', findings: 'Winding insulation breakdown suspected; third trip on this pump in 8 weeks.', parts: 'Spare motor 55 kW (requested)', bd: 'BD-0106', created: '2026-10-10T03:30' }),
  wo('WO-2610-008', 'CS-FRN-002', 'Preventive Maintenance', 'Burner service, refractory check and thermocouple calibration.', 'High', '2026-10-12T08:00', 6, 'U-003', 'Scheduled', { instr: 'Coordinate with casting shift for furnace turndown.', created: '2026-10-02T09:40' }),
  wo('WO-2610-009', 'CS-HMG-001', 'Corrective Maintenance', 'Replace circulation fan shaft seal and repair door gasket.', 'Medium', '2026-10-08T09:00', 5, 'U-003', 'On Hold', { start: '2026-10-08T09:20', performed: 'Oven drained of load and cooled. Seal removed.', findings: 'Shaft seal worn; replacement kit not in stock.', parts: 'Seal kit HO-SK30 (awaiting delivery)', remarks: 'On hold until spares arrive, expected 12 Oct.', created: '2026-10-03T13:15' }),
  wo('WO-2610-010', 'CS-CCM-001', 'Inspection', 'Mould table and water spray inspection before next campaign.', 'Medium', '2026-09-25T10:00', 2, 'U-003', 'Completed', { start: '2026-09-25T10:05', end: '2026-09-25T12:00', performed: 'Mould table levelled, 3 spray nozzles replaced.', findings: 'Nozzle blockage on strand 4.', parts: 'Spray nozzle x3', notes: 'No further action needed.', created: '2026-09-18T09:00' }),
  wo('WO-2610-011', 'PL-BUS-002', 'Corrective Maintenance', 'Repair coolant leak on busbar riser heat exchanger.', 'High', '2026-10-09T13:00', 8, 'U-005', 'In Progress', { start: '2026-10-09T13:15', performed: 'System drained, leaking tube bundle isolated.', findings: 'Tube corrosion at header weld.', parts: 'Tube bundle gasket set', created: '2026-10-08T15:30' }),
  wo('WO-2610-012', 'PL-CRN-003', 'Preventive Maintenance', 'Hoist brake inspection, wire rope check and limit switch test.', 'High', '2026-10-05T08:00', 4, 'U-005', 'Scheduled', { instr: 'Crane out of service during inspection; coordinate with potroom supervisor.', created: '2026-09-29T10:30' }),
  wo('WO-2610-013', 'PL-REC-001', 'Predictive Maintenance', 'Thermographic scan of rectifier diode stacks and cooling circuits.', 'Medium', '2026-10-15T10:00', 3, 'U-004', 'Scheduled', { created: '2026-10-06T11:00' }),
  wo('WO-2610-014', 'PL-TPV-002', 'Breakdown Maintenance', 'Replace ruptured hydraulic hose on tapping arm and test lift cycle.', 'Critical', '2026-10-10T11:00', 4, 'U-004', 'Scheduled', { bd: 'BD-0105', instr: 'Depressurise circuit before removal. Use rated hose assembly only.', created: '2026-10-10T05:15' }),
  wo('WO-2610-015', 'CS-SAW-001', 'Preventive Maintenance', 'Blade change and guide alignment (cancelled: rescheduled into next casting shutdown).', 'Low', '2026-10-02T09:00', 3, 'U-003', 'Cancelled', { remarks: 'Cancelled by manager. Not counted as completed maintenance.', created: '2026-09-25T09:00' }),
  wo('WO-2610-016', 'PL-FTP-001', 'Preventive Maintenance', 'Impeller balance check and bearing replacement.', 'Medium', '2026-09-28T08:00', 6, 'U-005', 'Completed', { start: '2026-09-28T08:10', end: '2026-09-28T15:00', performed: 'Bearings replaced on both ends; impeller balanced.', findings: 'DE bearing showed early pitting.', parts: 'Bearing 22218 x2', notes: 'Vibration within limits after restart.', created: '2026-09-20T10:00' }),
  wo('WO-2610-017', 'CP-CRS-002', 'Inspection', 'Wear-part inspection on jaw plates and toggle plate.', 'Medium', '2026-10-06T09:00', 2, 'U-002', 'Completed', { start: '2026-10-06T09:05', end: '2026-10-06T11:10', performed: 'Visual and ultrasonic inspection of jaw plates.', findings: 'Early surface crack noted on fixed jaw plate; recommended monitoring.', parts: 'None', remarks: 'Recommend replacement at next window.', notes: 'Report filed.', created: '2026-09-30T09:00' })
];

export const bd = (id, mid, reported, severity, desc, by, eng, status, x = {}) =>
  Object.assign({ id, mid, reported, severity, desc, by, eng, status, rootCause: '', action: '', repairStart: null, resolved: null, wo: null, ready: false, notes: [] }, x);
export const BDS = [
  bd('BD-0101', 'CS-PMP-007', '2026-08-14T08:20', 'High', 'Drive-end bearing seizure; pump tripped on high vibration.', 'Vikram Rao (Casting Shift Supervisor)', 'U-003', 'Closed', { rootCause: 'Bearing lubrication failure', action: 'Replaced DE bearing, flushed lubrication line', repairStart: '2026-08-14T09:00', resolved: '2026-08-14T14:50', notes: [{ t: '2026-08-14T14:50', who: 'Amit Kumar', text: 'Pump back in service after run test.' }] }),
  bd('BD-0102', 'CS-PMP-007', '2026-09-03T21:10', 'Medium', 'Mechanical seal leaking water onto pump base.', 'Night Shift Operator (Casting)', 'U-003', 'Closed', { rootCause: 'Seal face wear', action: 'Mechanical seal replaced', repairStart: '2026-09-03T22:00', resolved: '2026-09-04T01:10', notes: [{ t: '2026-09-04T01:10', who: 'Amit Kumar', text: 'Seal replaced, no leakage at operating pressure.' }] }),
  bd('BD-0103', 'PL-REC-001', '2026-10-02T03:40', 'High', 'Rectifier cooling fan trip with thermal alarm on stack B.', 'Control Room Operator (Potline)', 'U-004', 'Resolved', { rootCause: 'Failed cooling fan capacitor', action: 'Capacitor replaced, fan tested under load', repairStart: '2026-10-02T04:30', resolved: '2026-10-02T09:10', notes: [{ t: '2026-10-02T09:10', who: 'Priya Das', text: 'Temperatures normal. Awaiting manager closure.' }] }),
  bd('BD-0104', 'CS-FRN-002', '2026-09-27T10:00', 'Medium', 'Burner flame instability, furnace temperature hunting.', 'Casting Shift Supervisor', 'U-003', 'Closed', { rootCause: 'Fouled flame scanner lens', action: 'Scanner cleaned and re-aligned', repairStart: '2026-09-27T10:20', resolved: '2026-09-27T13:00', notes: [] }),
  bd('BD-0105', 'PL-TPV-002', '2026-10-10T04:50', 'Critical', 'Hydraulic hose rupture on tapping arm; vehicle immobilised in aisle.', 'Potroom Supervisor (Potline)', 'U-004', 'Acknowledged', { wo: 'WO-2610-014', notes: [{ t: '2026-10-10T05:10', who: 'Admin User', text: 'Assigned to Priya Das. Spare hose requested from stores.' }] }),
  bd('BD-0106', 'CS-PMP-007', '2026-10-10T03:15', 'Critical', 'Pump motor overheat trip; cooling water flow lost to casting line.', 'Casting Shift Supervisor', 'U-003', 'Under Repair', { repairStart: '2026-10-10T05:50', wo: 'WO-2610-007', rootCause: 'Under investigation (motor winding suspected)', notes: [{ t: '2026-10-10T03:30', who: 'Admin User', text: 'Standby pump started. Repeat failure: third breakdown on this machine.' }, { t: '2026-10-10T06:10', who: 'Amit Kumar', text: 'Motor removed for winding test.' }] }),
  bd('BD-0107', 'CP-CRS-002', '2026-10-10T06:20', 'High', 'Abnormal vibration and loud knocking; crusher stopped by operator.', 'Coke Handling Operator', 'U-002', 'Under Repair', { repairStart: '2026-10-10T06:45', wo: 'WO-2610-002', rootCause: 'Fixed jaw plate crack (to be confirmed)', notes: [{ t: '2026-10-10T06:50', who: 'Rahul Sharma', text: 'Crusher isolated. Jaw plate crack confirmed visually.' }] })
];

export const NOTIFS = {
  Manager: [
    { id: 'N1', sev: 'crit', title: 'Machine breakdown reported', text: 'CS-PMP-007 Cooling Water Pump tripped on motor overheat. Third breakdown in 8 weeks.', time: '10 Oct, 03:15', read: false, go: 'breakdowns' },
    { id: 'N2', sev: 'crit', title: 'Machine breakdown reported', text: 'PL-TPV-002 Metal Tapping Vehicle immobilised after hydraulic hose rupture.', time: '10 Oct, 04:50', read: false, go: 'breakdowns' },
    { id: 'N3', sev: 'warn', title: 'Scheduled maintenance job overdue', text: 'WO-2610-012 Potline Crane preventive maintenance is 5 days past schedule.', time: '10 Oct, 08:00', read: false, go: 'maintenance' },
    { id: 'N4', sev: 'warn', title: 'High-priority work order awaiting action', text: 'WO-2610-014 for PL-TPV-002 has not been started.', time: '10 Oct, 08:30', read: false, go: 'maintenance' },
    { id: 'N5', sev: 'ok', title: 'Work order completed', text: 'WO-2610-017 Crusher Unit inspection completed by Rahul Sharma.', time: '06 Oct, 11:10', read: true, go: 'maintenance' }
  ],
  Engineer: [
    { id: 'N6', sev: 'crit', title: 'High-priority work order assigned', text: 'WO-2610-002 Crusher Unit jaw plate replacement (Critical) assigned to you.', time: '10 Oct, 06:25', read: false, go: 'maintenance' },
    { id: 'N7', sev: 'warn', title: 'Preventive maintenance due today', text: 'WO-2610-003 Baking Furnace Exhaust Fan PM is scheduled for 14:00.', time: '10 Oct, 07:00', read: false, go: 'dashboard' },
    { id: 'N8', sev: 'warn', title: 'Scheduled maintenance job overdue', text: 'WO-2610-004 Anode Forming Press inspection was due on 07 Oct.', time: '10 Oct, 08:00', read: false, go: 'maintenance' },
    { id: 'N9', sev: 'info', title: 'Schedule changed', text: 'WO-2610-005 Anode Mixer Motor predictive survey set for 13 Oct, 09:00.', time: '09 Oct, 16:40', read: true, go: 'maintenance' },
    { id: 'N10', sev: 'crit', title: 'Machine breakdown reported', text: 'CP-CRS-002 Crusher Unit stopped on abnormal vibration.', time: '10 Oct, 06:20', read: true, go: 'breakdowns' }
  ]
};

export const ACTIVITY = [
  { t: '2026-10-10T06:50', type: 'update', text: 'Rahul Sharma isolated CP-CRS-002 and confirmed jaw plate crack.' },
  { t: '2026-10-10T06:25', type: 'create', text: 'Work order WO-2610-002 created for Crusher Unit (Critical).' },
  { t: '2026-10-10T06:20', type: 'breakdown', text: 'Breakdown BD-0107 reported on CP-CRS-002 Crusher Unit.' },
  { t: '2026-10-10T05:15', type: 'assign', text: 'WO-2610-014 assigned to Priya Das for PL-TPV-002.' },
  { t: '2026-10-10T04:50', type: 'breakdown', text: 'Breakdown BD-0105 reported on PL-TPV-002 Metal Tapping Vehicle.' },
  { t: '2026-10-10T03:15', type: 'breakdown', text: 'Breakdown BD-0106 reported on CS-PMP-007 Cooling Water Pump.' },
  { t: '2026-10-09T13:15', type: 'update', text: 'Work order WO-2610-011 moved to In Progress by Sandeep Patel.' },
  { t: '2026-10-08T09:20', type: 'update', text: 'Work order WO-2610-009 placed On Hold: spares awaited.' },
  { t: '2026-10-06T11:10', type: 'done', text: 'Work order WO-2610-017 completed for CP-CRS-002 Crusher Unit.' },
  { t: '2026-10-02T09:10', type: 'done', text: 'Breakdown BD-0103 on PL-REC-001 Rectifier Unit resolved.' }
];

/* historic breakdown counts (May-Jul) and completion-rate samples, by department */
export const HIST_BD = { 'Carbon Plant': [1, 0, 1], 'Casting': [1, 1, 2], 'Potline': [1, 1, 0] };
export const HIST_RATE = { 'Carbon Plant': [84, 86, 89, 87, 90, 88, 86], 'Casting': [80, 83, 85, 82, 88, 90, 87], 'Potline': [78, 82, 86, 84, 85, 87, 85] };
export const RATE_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
