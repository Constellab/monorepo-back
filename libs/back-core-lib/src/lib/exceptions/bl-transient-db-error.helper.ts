/**
 * Error codes/messages emitted by the mysql2 driver when a pooled
 * connection was closed by the server (or a proxy) while idle. These
 * failures are transient: retrying the query on a fresh connection
 * succeeds. Matches the "Connection lost: The server closed the
 * connection" error seen after idle periods.
 */
const TRANSIENT_DB_ERRORS = ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT', 'CONN_CLOSING', 'EPIPE'];

const TRANSIENT_DB_MESSAGES = [
  'Connection lost',
  'The server closed the connection',
  'read ECONNRESET',
  'Pool is closed',
];

/**
 * Returns true when the error is a transient database connection error
 * (e.g. a pooled connection closed by the server/proxy while idle).
 */
export function blIsTransientDbError(err: unknown): boolean {
  if (err == null || typeof err !== 'object') {
    return false;
  }

  const code = (err as { code?: string }).code;
  if (code != null && TRANSIENT_DB_ERRORS.includes(code)) {
    return true;
  }

  const message = (err as { message?: string }).message;
  if (message != null) {
    return TRANSIENT_DB_MESSAGES.some((m) => message.includes(m));
  }

  return false;
}
