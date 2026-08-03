import { describe, expect, it } from 'vitest';
import reducer, { bootstrapAuth, login, logout, register, updateCurrentUser } from './authSlice';

const initialState = { user: null, status: 'idle', authChecked: false, error: null };
const user = { _id: 'u1', name: 'Jane Doe', role: 'customer' };

describe('authSlice reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('marks the auth check as complete with a user after a successful bootstrap', () => {
    const state = reducer(initialState, bootstrapAuth.fulfilled(user, 'req1'));
    expect(state.status).toBe('succeeded');
    expect(state.authChecked).toBe(true);
    expect(state.user).toEqual(user);
  });

  it('marks the auth check as complete with no user when bootstrap fails', () => {
    const state = reducer(initialState, bootstrapAuth.rejected(new Error('no session'), 'req1'));
    expect(state.status).toBe('idle');
    expect(state.authChecked).toBe(true);
    expect(state.user).toBeNull();
  });

  it('logs the user in on a successful login', () => {
    const state = reducer(initialState, login.fulfilled(user, 'req1', { email: 'jane@test.com', password: 'x' }));
    expect(state.status).toBe('succeeded');
    expect(state.user).toEqual(user);
  });

  it('records the error message when login fails', () => {
    const state = reducer(
      initialState,
      login.rejected(new Error('bad creds'), 'req1', { email: 'jane@test.com', password: 'x' }, 'Unable to log in')
    );
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Unable to log in');
  });

  it('logs the user in on successful registration', () => {
    const state = reducer(initialState, register.fulfilled(user, 'req1', { name: 'Jane', email: 'jane@test.com' }));
    expect(state.status).toBe('succeeded');
    expect(state.user).toEqual(user);
  });

  it('clears the user on logout', () => {
    const loggedIn = { user, status: 'succeeded', authChecked: true, error: null };
    const state = reducer(loggedIn, logout.fulfilled(undefined, 'req1'));
    expect(state.user).toBeNull();
    expect(state.status).toBe('idle');
  });

  it('updates the current user in place via updateCurrentUser', () => {
    const loggedIn = { user, status: 'succeeded', authChecked: true, error: null };
    const updated = { ...user, name: 'Jane Smith' };
    const state = reducer(loggedIn, updateCurrentUser(updated));
    expect(state.user.name).toBe('Jane Smith');
  });
});
