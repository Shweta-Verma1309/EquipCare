
import { Icon, stop } from './ui';
import { openDrawer, openModal } from '../lib/store';
import { woStart, woResume } from '../lib/actions';

export default function WoBtn({ w }) {
  const id = w.workOrderId ?? w.id;

  const b = {
    Open: {
      fn: () => woStart(id),
      label: 'Start Work',
      ico: 'play'
    },
    Assigned: {
      fn: () => woStart(id),
      label: 'Start Work',
      ico: 'play'
    },
    Scheduled: {
      fn: () => woStart(id),
      label: 'Start Work',
      ico: 'play'
    },
    'In Progress': {
      fn: () => openModal('woProgress', { id }),
      label: 'Update Progress',
      ico: 'edit'
    },
    'On Hold': {
      fn: () => woResume(id),
      label: 'Resume Work',
      ico: 'play'
    }
  }[w.status];

  return (
    <div className="actions" style={{ flexWrap: 'nowrap' }}>
      {b && (
        <button
          type="button"
          className="btn sm primary"
          onClick={stop(b.fn)}
        >
          <Icon name={b.ico} cls="sm" />
          {b.label}
        </button>
      )}
      <button
        type="button"
        className="btn sm"
        onClick={stop(() => openDrawer('wo', id))}
      >
        View Details
      </button>
    </div>
  );
}
