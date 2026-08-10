import { Logger } from '@nestjs/common';

/**
 * Read a JSON record back out of {@link BlRedisStore}, treating an unreadable one as absent.
 *
 * Every store over this Redis surface keeps short-lived records that a caller looks up by an
 * opaque key — an OAuth client registration, an authorization code, a pending consent — and
 * they all want the same two answers: the record, or nothing. Absent and corrupt are the same
 * answer on purpose: whatever a caller does about a key it cannot find, it should do about a
 * key whose value it cannot read, and the alternative is a 500 on a record that is about to
 * expire anyway.
 *
 * Shared because it was written four times over, and each copy is a place where one of them
 * could start throwing instead.
 *
 * @param description what was being read, for the log line. A corrupt entry is worth saying
 * out loud once — it means something wrote a value this code cannot parse — without failing
 * the request over it.
 */
export function blParseStoredJson<T>(raw: string | null, logger: Logger, description: string): T | null {
  if (raw == null) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    logger.warn(`Discarded an unparsable ${description}`);
    return null;
  }
}
