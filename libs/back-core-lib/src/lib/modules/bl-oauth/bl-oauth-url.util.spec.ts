import { blBuildUrlWithParams, blStripTrailingSlashes } from './bl-oauth-url.util';

describe('blStripTrailingSlashes', () => {
  it('leaves a value with no trailing slash alone', () => {
    expect(blStripTrailingSlashes('https://api.example.com')).toBe('https://api.example.com');
    expect(blStripTrailingSlashes('/mcp/community-doc')).toBe('/mcp/community-doc');
  });

  it('strips one trailing slash', () => {
    expect(blStripTrailingSlashes('https://api.example.com/')).toBe('https://api.example.com');
  });

  it('strips several trailing slashes', () => {
    expect(blStripTrailingSlashes('https://api.example.com///')).toBe('https://api.example.com');
  });

  it('never touches an interior slash', () => {
    expect(blStripTrailingSlashes('https://api.example.com/mcp/community-doc/')).toBe(
      'https://api.example.com/mcp/community-doc'
    );
  });

  it('collapses a value that is nothing but slashes to empty', () => {
    expect(blStripTrailingSlashes('/')).toBe('');
    expect(blStripTrailingSlashes('///')).toBe('');
  });

  it('passes an empty string through', () => {
    expect(blStripTrailingSlashes('')).toBe('');
  });
});

describe('blBuildUrlWithParams', () => {
  it('appends the parameters to a bare URL', () => {
    const url = new URL(blBuildUrlWithParams('https://claude.ai/callback', { code: 'the-code' }));

    expect(url.searchParams.get('code')).toBe('the-code');
  });

  it('keeps a query string the base URL already carried', () => {
    // A client may register a redirect target with its own parameters; overwriting them
    // sends the code somewhere the client cannot correlate with the request it made.
    const url = new URL(blBuildUrlWithParams('https://claude.ai/callback?session=abc', { code: 'the-code' }));

    expect(url.searchParams.get('session')).toBe('abc');
    expect(url.searchParams.get('code')).toBe('the-code');
  });

  it('omits an absent value rather than serializing it', () => {
    // An authorization request without `state` must come back without one — `state=undefined`
    // is a value the client never sent and would fail its own comparison.
    const url = new URL(
      blBuildUrlWithParams('https://claude.ai/callback', { code: 'the-code', state: undefined })
    );

    expect(url.searchParams.has('state')).toBe(false);
  });

  it('escapes a value rather than letting it add a parameter of its own', () => {
    const url = new URL(blBuildUrlWithParams('https://claude.ai/callback', { state: 'a&code=forged' }));

    expect(url.searchParams.get('state')).toBe('a&code=forged');
    expect(url.searchParams.get('code')).toBeNull();
  });
});
