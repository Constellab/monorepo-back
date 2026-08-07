import { blStripTrailingSlashes } from './bl-oauth-url.util';

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
