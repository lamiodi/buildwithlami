// Lightweight in-memory notification helper.
// Uses a global event bus so any module can call notify.* without prop-drilling.
// The actual UI is rendered by <ToastHost /> in App.jsx, which subscribes to
// the same bus.

const listeners = new Set();
let nextId = 1;

const emit = (toast) => {
    listeners.forEach((cb) => cb(toast));
};

const dismiss = (id) => {
    emit({ id, type: 'dismiss' });
};

const show = (type, message, durationMs = 3500) => {
    const id = nextId++;
    emit({ id, type, message, durationMs });
    return id;
};

export const notify = {
    success: (msg, ms) => show('success', msg, ms),
    error:   (msg, ms) => show('error',   msg, ms || 5000),
    info:    (msg, ms) => show('info',    msg, ms),
    warn:    (msg, ms) => show('warn',    msg, ms || 4500),
    dismiss,
};

export const subscribeToasts = (cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};
