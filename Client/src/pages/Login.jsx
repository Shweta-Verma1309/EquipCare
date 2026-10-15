
import { useState } from 'react';
import { Icon } from '../components/ui';
import { S, emit, navigate } from '../lib/store';
import { Brand } from './Landing';
import { apiRequest } from '../lib/api';

function normalizeRole(role) {
  const value = String(
    typeof role === 'string'
      ? role
      : role?.roleName ?? role?.name ?? ''
  )
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (
    ['manager', 'maintenance manager'].includes(value)
  ) {
    return 'Manager';
  }

  if (
    [
      'engineer',
      'maintenance engineer',
      'maintenanceengineer',
    ].includes(value.replace(/\s+/g, ''))
  ) {
    return 'Engineer';
  }

  return null;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !pass) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password: pass,
        }),
      });

      if (!data?.token) {
        throw new Error(
          'The server did not return an authentication token.'
        );
      }

      const rawRoles = data.roles ?? data.user?.roles ?? [];

      const roles = Array.isArray(rawRoles)
        ? rawRoles
        : [rawRoles];

      const normalizedRoles = roles
        .map(normalizeRole)
        .filter(Boolean);

      if (normalizedRoles.length === 0) {
        throw new Error(
          `Unsupported application role. Roles returned: ${JSON.stringify(rawRoles)}`
        );
      }

      const actualRole = normalizedRoles[0];

      const user = {
        ...(data.user ?? {}),
        userId: data.user?.userId ?? data.userId,
        fullName: data.user?.fullName ?? data.fullName,
        email: data.user?.email ?? data.email ?? email.trim(),
        roles: normalizedRoles,
      };

      // Clear previous sessions before saving the new login.
      localStorage.removeItem('emms_token');
      localStorage.removeItem('emms_user');
      sessionStorage.removeItem('emms_token');
      sessionStorage.removeItem('emms_user');

      const storage = remember ? localStorage : sessionStorage;

      storage.setItem('emms_token', data.token);
      storage.setItem('emms_user', JSON.stringify(user));

      S.role = actualRole;
      emit();

      navigate(
        actualRole === 'Manager'
          ? 'manager/dashboard'
          : 'engineer/dashboard'
      );
    } catch (err) {
      setError(
        err.message || 'Login failed. Check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="l">
        <Brand onClick={() => navigate('')} />

        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Carbon Plant · Casting · Potline
          </div>

          <h2>
            Plan the work. Fix the failures. Keep the plant running.
          </h2>

          <p
            className="lead"
            style={{ color: '#c4d1de', marginBottom: 22 }}
          >
            Sign in to see equipment health, work orders and maintenance
            information for your role.
          </p>

          <ul>
            <li>
              <Icon name="gauge" cls="sm" />
              Live view of machine status and overdue work
            </li>
            <li>
              <Icon name="clip" cls="sm" />
              Work orders from schedule to completion notes
            </li>
            <li>
              <Icon name="alert" cls="sm" />
              Maintenance tracking and equipment reliability
            </li>
          </ul>
        </div>

        <div
          style={{
            fontSize: 12.5,
            color: '#a9b4c0',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Icon name="lock" cls="sm" />
          Sessions are for authorised plant personnel only.
        </div>
      </div>

      <div className="r">
        <form onSubmit={submit} noValidate>
          <div>
            <h2 style={{ fontSize: 30 }}>Welcome back</h2>
            <p className="muted">
              Sign in to the maintenance console.
            </p>
          </div>

          <div className="fld">
            <label htmlFor="email">Email</label>
            <input
              className="inp"
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="fld">
            <label htmlFor="pass">Password</label>
            <div className="pw">
              <input
                className="inp"
                id="pass"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                <Icon name={show ? 'eyeoff' : 'eye'} cls="sm" />
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <label className="chk">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
          </div>

          {error && (
            <div className="note t-error" role="alert">
              <Icon name="alert" cls="sm" />
              <span>{error}</span>
            </div>
          )}

          <button
            className="btn primary lg"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="note t-info">
            <Icon name="lock" cls="sm" />
            <span>
              Sign in using an account created by your administrator.
              Your assigned role determines which features you can access.
            </span>
          </div>

          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate('')}
          >
            ← Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}
