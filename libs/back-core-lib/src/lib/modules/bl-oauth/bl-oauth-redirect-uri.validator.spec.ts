import { BL_OAUTH_LIMITS } from './bl-oauth.constants';
import {
  blRedirectUriAllowed,
  BlRedirectUrisValidation,
  blValidateRedirectUris,
} from './bl-oauth-redirect-uri.validator';

const allowlist = ['https://claude.ai/api/mcp/auth_callback'];

const allowed = (uri: string, list: string[] = allowlist): boolean => blRedirectUriAllowed(uri, list);

const loopback = (index: number): string => `http://localhost:9999/callback-${index}`;

describe('blRedirectUriAllowed', () => {
  describe('non-loopback URIs', () => {
    it('accepts an exact allowlist match', () => {
      expect(allowed('https://claude.ai/api/mcp/auth_callback')).toBe(true);
    });

    it('accepts the default port written explicitly', () => {
      expect(allowed('https://claude.ai:443/api/mcp/auth_callback')).toBe(true);
    });

    it("rejects an attacker's domain", () => {
      expect(allowed('https://evil.example.com/callback')).toBe(false);
    });

    it('rejects a subdomain of an allowed host', () => {
      expect(allowed('https://evil.claude.ai/api/mcp/auth_callback')).toBe(false);
    });

    it('rejects a different path on an allowed host', () => {
      expect(allowed('https://claude.ai/api/mcp/other')).toBe(false);
    });

    it('rejects an added query string', () => {
      expect(allowed('https://claude.ai/api/mcp/auth_callback?next=https://evil.example.com')).toBe(false);
    });

    it('rejects a non-default port on an allowed host', () => {
      expect(allowed('https://claude.ai:8443/api/mcp/auth_callback')).toBe(false);
    });

    it('rejects http even when the host and path are allowed', () => {
      expect(allowed('http://claude.ai/api/mcp/auth_callback')).toBe(false);
    });

    it('rejects everything when the allowlist is empty', () => {
      expect(allowed('https://claude.ai/api/mcp/auth_callback', [])).toBe(false);
    });
  });

  describe('loopback URIs (RFC 8252 native apps)', () => {
    it('accepts localhost on any port', () => {
      expect(allowed('http://localhost:9999/callback')).toBe(true);
      expect(allowed('http://localhost:54321/callback')).toBe(true);
    });

    it('accepts localhost on any path', () => {
      expect(allowed('http://localhost:9999/some/other/path')).toBe(true);
    });

    it('accepts 127.0.0.1 and ::1', () => {
      expect(allowed('http://127.0.0.1:9999/callback')).toBe(true);
      expect(allowed('http://[::1]:9999/callback')).toBe(true);
    });

    it('accepts loopback over https too', () => {
      expect(allowed('https://localhost:9999/callback')).toBe(true);
    });

    it('accepts loopback with an empty allowlist', () => {
      expect(allowed('http://localhost:9999/callback', [])).toBe(true);
    });

    it('does not treat a host merely containing "localhost" as loopback', () => {
      expect(allowed('https://localhost.evil.example.com/callback')).toBe(false);
      expect(allowed('https://notlocalhost/callback')).toBe(false);
    });
  });

  describe('malformed and hostile input', () => {
    it('rejects a fragment (RFC 6749 §3.1.2)', () => {
      expect(allowed('https://claude.ai/api/mcp/auth_callback#frag')).toBe(false);
      expect(allowed('http://localhost:9999/callback#frag')).toBe(false);
    });

    it('rejects non-http schemes without throwing', () => {
      expect(allowed('javascript:alert(1)')).toBe(false);
      expect(allowed('data:text/html,<script>1</script>')).toBe(false);
      expect(allowed('file:///etc/passwd')).toBe(false);
    });

    it('rejects unparsable values without throwing', () => {
      expect(allowed('')).toBe(false);
      expect(allowed('not a uri')).toBe(false);
      expect(allowed('/relative/callback')).toBe(false);
    });

    it('ignores unparsable allowlist entries instead of throwing', () => {
      expect(allowed('https://claude.ai/api/mcp/auth_callback', ['', 'nonsense', allowlist[0]])).toBe(true);
      expect(allowed('https://claude.ai/api/mcp/auth_callback', ['nonsense'])).toBe(false);
    });
  });
});

describe('blValidateRedirectUris', () => {
  const validate = (value: unknown): BlRedirectUrisValidation => blValidateRedirectUris(value, allowlist);

  describe('shape', () => {
    it('accepts a valid single-entry list', () => {
      expect(validate([allowlist[0]])).toEqual({ ok: true, redirectUris: [allowlist[0]] });
    });

    it.each([[undefined], [null], ['a-string'], [{}], [[]], [[123]], [['']], [[allowlist[0], 7]]])(
      'rejects a malformed redirect_uris value: %p',
      (value) => {
        expect(validate(value)).toEqual({
          ok: false,
          errorDescription: 'redirect_uris must be a non-empty array of strings',
        });
      }
    );
  });

  describe('bounds', () => {
    it('accepts exactly the maximum number of entries', () => {
      const uris = Array.from({ length: BL_OAUTH_LIMITS.maxRedirectUris }, (_, i) => loopback(i));
      expect(validate(uris).ok).toBe(true);
    });

    it('rejects one entry over the maximum', () => {
      const uris = Array.from({ length: BL_OAUTH_LIMITS.maxRedirectUris + 1 }, (_, i) => loopback(i));
      const result = validate(uris);
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('errorDescription', expect.stringContaining('at most'));
    });

    it('rejects an over-long entry', () => {
      const long = `http://localhost:9999/${'a'.repeat(BL_OAUTH_LIMITS.maxRedirectUriLength)}`;
      const result = validate([long]);
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('errorDescription', expect.stringContaining('characters'));
    });

    it('reports an over-long entry without echoing it', () => {
      const long = `http://localhost:9999/${'a'.repeat(BL_OAUTH_LIMITS.maxRedirectUriLength)}`;
      const result = validate([long]);
      const description = result.ok ? '' : result.errorDescription;
      expect(description).not.toContain('aaaa');
      expect(description.length).toBeLessThan(200);
    });
  });

  describe('policy failures', () => {
    it('rejects the whole request when a single entry is disallowed', () => {
      const result = validate([loopback(0), 'https://evil.example.com/cb']);
      expect(result).toEqual({
        ok: false,
        errorDescription: 'redirect_uri not allowed: https://evil.example.com/cb',
      });
    });

    it('caps how many rejected entries it echoes back', () => {
      const rejected = Array.from({ length: 8 }, (_, i) => `https://evil${i}.example.com/cb`);
      const result = validate(rejected);
      const description = result.ok ? '' : result.errorDescription;
      expect(description).toContain('https://evil0.example.com/cb');
      expect(description).toContain(`and ${8 - BL_OAUTH_LIMITS.maxRejectedUrisReported} more`);
      expect(description).not.toContain('https://evil7.example.com/cb');
    });

    it('does not add a "more" suffix when everything is reported', () => {
      const result = validate(['https://evil.example.com/cb']);
      const description = result.ok ? '' : result.errorDescription;
      expect(description).not.toContain('more');
    });
  });
});
