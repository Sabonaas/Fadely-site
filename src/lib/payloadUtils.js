/** UUID v4 — evita enviar "" ao Postgres */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

const EMPTY_UUID_SENTINELS = new Set(['', '__other__', 'null', 'undefined']);

/**
 * Remove chaves UUID inválidas do payload (nunca envia "").
 * @param {Record<string, unknown>} row
 * @param {string[]} [extraUuidKeys]
 */
export function sanitizeUuidPayload(row, extraUuidKeys = []) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  const keys = new Set([
    ...extraUuidKeys,
    ...Object.keys(out).filter((k) => k === 'id' || k.endsWith('_id')),
  ]);

  for (const key of keys) {
    if (!(key in out)) continue;
    const v = out[key];
    if (v == null) continue;
    if (EMPTY_UUID_SENTINELS.has(String(v).trim()) || !isValidUuid(String(v))) {
      delete out[key];
    }
  }
  return out;
}

/** Log estruturado em desenvolvimento */
export function logDbPayload(ctx, payload) {
  if (!import.meta.env.DEV) return;
  const uuids = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (k.endsWith('_id') || k === 'id') uuids[k] = v;
  }
  console.group(`[db:${ctx}] payload`);
  console.log('final', payload);
  console.log('uuids', uuids);
  if (payload?.organization_id !== undefined) console.log('organization_id', payload.organization_id);
  if (payload?.user_id !== undefined) console.log('user_id', payload.user_id);
  if (payload?.employee_id !== undefined) console.log('employee_id', payload.employee_id);
  console.groupEnd();
}
