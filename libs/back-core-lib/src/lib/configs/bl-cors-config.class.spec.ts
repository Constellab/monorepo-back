import {
  BL_CORS_ALLOWED_DOMAINS_KEY,
  blGetCorsAllowedDomains,
  blGetCorsConfig,
} from './bl-cors-config.class';

describe('blGetCorsAllowedDomains', () => {
  const originalValue = process.env[BL_CORS_ALLOWED_DOMAINS_KEY];

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[BL_CORS_ALLOWED_DOMAINS_KEY];
    } else {
      process.env[BL_CORS_ALLOWED_DOMAINS_KEY] = originalValue;
    }
  });

  it('splits the list, trimming the entries and dropping the empty ones', () => {
    process.env[BL_CORS_ALLOWED_DOMAINS_KEY] = ' constellab.space , preconstellab.com ,, ';

    expect(blGetCorsAllowedDomains(false)).toEqual(['constellab.space', 'preconstellab.com']);
  });

  it('stops the bootstrap when unset outside a local environment', () => {
    delete process.env[BL_CORS_ALLOWED_DOMAINS_KEY];

    expect(() => blGetCorsAllowedDomains(false)).toThrow(BL_CORS_ALLOWED_DOMAINS_KEY);
  });

  it('accepts an empty list locally, where every origin is allowed anyway', () => {
    process.env[BL_CORS_ALLOWED_DOMAINS_KEY] = '';

    expect(blGetCorsAllowedDomains(true)).toEqual([]);
  });
});

describe('blGetCorsConfig', () => {
  function matches(origins: unknown, candidate: string): boolean {
    return (origins as (RegExp | string)[]).some((origin) =>
      typeof origin === 'string' ? origin === candidate : origin.test(candidate)
    );
  }

  it('allows the domain itself and its sub-domains over https', () => {
    const origin = blGetCorsConfig(['constellab.space'], false).origin;

    expect(matches(origin, 'https://constellab.space')).toBe(true);
    expect(matches(origin, 'https://api.constellab.space')).toBe(true);
  });

  it('escapes the dots, so a look-alike domain is not accepted', () => {
    const origin = blGetCorsConfig(['constellab.space'], false).origin;

    expect(matches(origin, 'https://constellabxspace')).toBe(false);
  });
});
