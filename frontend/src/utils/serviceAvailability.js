const aborted = () => new DOMException('The request was cancelled.', 'AbortError');

function waitFor(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(aborted());
  return new Promise((resolve, reject) => {
    const cancel = () => { signal.removeEventListener('abort', cancel); reject(aborted()); };
    signal.addEventListener('abort', cancel, {once:true});
    promise.then(value => { signal.removeEventListener('abort', cancel); resolve(value); }, error => { signal.removeEventListener('abort', cancel); reject(error); });
  });
}

// Share the initial readiness check. Waiting callers can cancel independently;
// cancelling a search must not cancel another caller's pending submission.
export function createServiceAvailability({ check, now = Date.now, freshForMs = 60_000 }) {
  let readyUntil = 0;
  let pending;
  return {
    ensure(signal) {
      if (signal?.aborted) return Promise.reject(aborted());
      if (now() < readyUntil) return Promise.resolve();
      if (!pending) {
        pending = Promise.resolve().then(check).then(() => {
          readyUntil = now() + freshForMs;
        }).finally(() => { pending = undefined; });
      }
      return waitFor(pending, signal);
    },
    invalidate() { readyUntil = 0; },
  };
}
