import type { PostgrestError, AuthError } from '@supabase/supabase-js';

export class FadelyError extends Error {
  readonly code: string;
  readonly status: number;
  readonly cause?: unknown;

  constructor(message: string, code = 'FADELY_ERROR', status = 400, cause?: unknown) {
    super(message);
    this.name = 'FadelyError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

export function mapSupabaseError(error: PostgrestError | AuthError | null): FadelyError {
  if (!error) return new FadelyError('Unknown error', 'UNKNOWN', 500);

  const pg = error as PostgrestError;
  if (pg.code === 'PGRST116') {
    return new FadelyError('Resource not found', 'NOT_FOUND', 404, error);
  }
  if (pg.code === '42501' || pg.message?.includes('permission')) {
    return new FadelyError('Access denied', 'FORBIDDEN', 403, error);
  }
  if (pg.code === '23505') {
    return new FadelyError('Conflict: record already exists', 'CONFLICT', 409, error);
  }

  return new FadelyError(error.message || 'Database error', pg.code || 'DB_ERROR', 500, error);
}

export function assertOk<T>(data: T | null, error: PostgrestError | null, ctx: string): T {
  if (error) throw mapSupabaseError(error);
  if (data === null || data === undefined) {
    throw new FadelyError(`${ctx}: empty result`, 'EMPTY', 404);
  }
  return data;
}
